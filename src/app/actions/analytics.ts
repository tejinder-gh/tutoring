"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addDays, endOfDay, endOfWeek, endOfYear, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths, subWeeks, subYears } from "date-fns";

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

export type TrendPeriod = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';

interface TrendMetric {
    value: number;
    previousValue: number;
    change: number; // Percentage change
    trend: 'up' | 'down' | 'neutral';
}

function calculateTrend(current: number, previous: number): TrendMetric {
    let change = 0;
    if (previous > 0) {
        change = ((current - previous) / previous) * 100;
    } else if (current > 0) {
        change = 100; // 100% increase if previous was 0
    }

    return {
        value: current,
        previousValue: previous,
        change: Math.round(change),
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
}

export async function getDashboardMetrics(period: TrendPeriod = 'MONTHLY') {
    const session = await auth();
    if (!session?.user?.id) return null;

    const now = new Date();
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

    switch (period) {
        case 'DAILY':
            currentStart = startOfDay(now);
            currentEnd = endOfDay(now);
            previousStart = subDays(currentStart, 1);
            previousEnd = subDays(currentEnd, 1);
            break;
        case 'WEEKLY':
            currentStart = startOfWeek(now, { weekStartsOn: 1 });
            currentEnd = endOfWeek(now, { weekStartsOn: 1 });
            previousStart = subWeeks(currentStart, 1);
            previousEnd = subWeeks(currentEnd, 1);
            break;
        case 'BIWEEKLY':
            currentStart = subDays(startOfDay(now), 14);
            currentEnd = endOfDay(now);
            previousStart = subDays(currentStart, 14);
            previousEnd = subDays(currentEnd, 14);
            break;
        case 'YEARLY':
            currentStart = startOfYear(now);
            currentEnd = endOfYear(now);
            previousStart = subYears(currentStart, 1);
            previousEnd = subYears(currentEnd, 1);
            break;
        case 'MONTHLY':
        default:
            currentStart = startOfMonth(now);
            currentEnd = endOfDay(now); // Up to now
            previousStart = subMonths(currentStart, 1);
            previousEnd = subMonths(currentEnd, 1); // Note: this compares partial month to partial month if we want exact comparison, or full prev month. Let's compare "same period previous month"
            // Actually simpler: Full Previous Month vs Current Month-to-date?
            // User asked for "project if anything moved... on monthly basis".
            // Let's do: Current Month vs Previous Month.
            break;
    }

    // 1. Revenue
    const [currentRevenue, previousRevenue] = await Promise.all([
        prisma.paymentReceipts.aggregate({
            _sum: { amountPaid: true },
            where: { paymentDate: { gte: currentStart, lte: currentEnd } }
        }),
        prisma.paymentReceipts.aggregate({
            _sum: { amountPaid: true },
            where: { paymentDate: { gte: previousStart, lte: previousEnd } }
        })
    ]);

    // 2. Leads
    const [currentLeads, previousLeads] = await Promise.all([
        prisma.lead.count({ where: { createdAt: { gte: currentStart, lte: currentEnd } } }),
        prisma.lead.count({ where: { createdAt: { gte: previousStart, lte: previousEnd } } })
    ]);

    // 3. New Students (Enrollments)
    const [currentEnrollments, previousEnrollments] = await Promise.all([
        prisma.enrollment.count({ where: { enrolledAt: { gte: currentStart, lte: currentEnd } } }),
        prisma.enrollment.count({ where: { enrolledAt: { gte: previousStart, lte: previousEnd } } })
    ]);

    return {
        revenue: calculateTrend(Number(currentRevenue._sum.amountPaid || 0), Number(previousRevenue._sum.amountPaid || 0)),
        leads: calculateTrend(currentLeads, previousLeads),
        enrollments: calculateTrend(currentEnrollments, previousEnrollments),
        periodLabel: period
    };
}
