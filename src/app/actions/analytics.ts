"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addDays, format, startOfMonth, subMonths } from "date-fns";

export async function getStudentAnalytics() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // 1. Enrollment Stats
  const enrollments = await prisma.enrollment.findMany({
    where: { studentProfile: { userId } },
    include: { course: true }
  });

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length;
  const activeCourses = enrollments.filter(e => e.status === 'ACTIVE').length;

  // 2. Quiz Performance (Recent 5)
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: 5,
    include: { quiz: { select: { title: true } } }
  });

  const recentQuizScores = quizAttempts.map(attempt => ({
    name: attempt.quiz.title,
    score: attempt.score || 0,
    total: 100 // Assuming percentage
  }));

  // 3. Attendance Overview (Last 30 days present vs absent)
  // Simplified for demo
  const attendance = await prisma.attendance.findMany({
      where: { userId },
      take: 30,
      orderBy: { date: 'desc' }
  });

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const totalTracked = attendance.length;
  const attendanceRate = totalTracked > 0 ? (presentCount / totalTracked) * 100 : 100;

  return {
    overview: {
        totalCourses,
        completedCourses,
        activeCourses,
        attendanceRate: Math.round(attendanceRate)
    },
    recentQuizScores,
    // Add more detail if needed
  };
}

export async function getAdminAnalytics() {
    const session = await auth();
    // In real app, check admin role
    if (!session?.user?.id) return null;

    // 1. Monthly Revenue (Last 6 months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date);
        const nextMonth = startOfMonth(addDays(new Date(date.getFullYear(), date.getMonth() + 1, 0), 1));

        const monthlyRevenue = await prisma.paymentReceipts.aggregate({
            _sum: { amountPaid: true },
            where: {
                paymentDate: {
                    gte: start,
                    lt: nextMonth
                }
            }
        });

        revenueData.push({
            name: format(date, 'MMM'),
            revenue: Number(monthlyRevenue._sum.amountPaid || 0)
        });
    }

    // 2. Total Stats
    const totalStudents = await prisma.user.count({ where: { roleId: { not: null } } }); // Approximation
    const totalCourses = await prisma.course.count();
    const totalRevenue = await prisma.paymentReceipts.aggregate({ _sum: { amountPaid: true } });

    // 3. Top Courses by Enrollment
    const popularCourses = await prisma.enrollment.groupBy({
        by: ['courseId'],
        _count: { courseId: true },
        orderBy: {
            _count: { courseId: 'desc' }
        },
        take: 5
    });

    const enrichedPopularCourses = (await Promise.all(popularCourses.map(async (item) => {
        if (!item.courseId) return null;
        const course = await prisma.course.findUnique({ where: { id: item.courseId }, select: { title: true } });
        return {
            name: course?.title || 'Unknown',
            students: item._count.courseId
        };
    }))).filter((item): item is NonNullable<typeof item> => item !== null);

    return {
        revenueData,
        overview: {
            totalStudents,
            totalCourses,
            totalRevenue: Number(totalRevenue._sum.amountPaid || 0)
        },
        popularCourses: enrichedPopularCourses
    };
}
