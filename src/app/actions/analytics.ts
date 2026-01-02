"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { endOfDay, endOfWeek, endOfYear, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths, subWeeks, subYears } from "date-fns";
import { unstable_cache } from "next/cache";

export async function getTeacherAnalytics() {
    const session = await auth();
    if (!session?.user?.id) return null;
    const userId = session.user.id;

    const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId },
        include: {
            courses: {
                include: {
                    batches: {
                        where: { isActive: true },
                        include: {
                            enrollments: true,
                            events: {
                                where: { startTime: { gte: new Date() } },
                                take: 5,
                                orderBy: { startTime: 'asc' }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!teacherProfile) return null;

    // 1. Total Students (Unique Enrollments across all active batches)
    const studentIds = new Set<string>();
    let totalActiveBatches = 0;
    const upcomingClasses: any[] = [];

    teacherProfile.courses.forEach((course: any) => {
        course.batches.forEach((batch: any) => {
            totalActiveBatches++;
            batch.enrollments.forEach((enrollment: any) => {
                if (enrollment.status === 'ACTIVE') {
                    studentIds.add(enrollment.studentProfileId);
                }
            });
            // Collect upcoming events
            batch.events.forEach((event: any) => {
                if (event.type === 'CLASS') {
                    upcomingClasses.push({
                        id: event.id,
                        title: event.title,
                        startTime: event.startTime,
                        batchName: batch.name,
                        courseTitle: course.title
                    });
                }
            });
        });
    });

    // Sort upcoming classes globally
    upcomingClasses.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return {
        overview: {
            totalStudents: studentIds.size,
            activeBatches: totalActiveBatches,
            activeCourses: teacherProfile.courses.length,
        },
        upcomingClasses: upcomingClasses.slice(0, 5),
        // Add more as needed
    };
}

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
  const completedCourses = enrollments.filter((e: any) => e.status === 'COMPLETED').length;
  const activeCourses = enrollments.filter((e: any) => e.status === 'ACTIVE').length;

  // 2. Quiz Performance (Recent 5)
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: 5,
    include: { quiz: { select: { title: true } } }
  });

  const recentQuizScores = quizAttempts.map((attempt: any) => ({
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

  const presentCount = attendance.filter((a: any) => a.status === 'PRESENT').length;
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

const getCachedAdminAnalyticsData = unstable_cache(
    async (period: TrendPeriod) => {
        const revenueData = [];
        const now = new Date();

        // Determine loop count and date grouping strategy
        if (period === 'DAILY') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = subDays(now, i);
                const start = startOfDay(date);
                const end = endOfDay(date);

                const dailyRevenue = await prisma.paymentReceipts.aggregate({
                    _sum: { amountPaid: true },
                    where: { paymentDate: { gte: start, lte: end } }
                });

                revenueData.push({
                    name: format(date, 'EEE'), // Mon, Tue...
                    revenue: Number(dailyRevenue._sum.amountPaid || 0)
                });
            }
        } else if (period === 'WEEKLY') {
            // Last 4 weeks
            for (let i = 3; i >= 0; i--) {
                const date = subWeeks(now, i);
                const start = startOfWeek(date, { weekStartsOn: 1 });
                const end = endOfWeek(date, { weekStartsOn: 1 });

                const weeklyRevenue = await prisma.paymentReceipts.aggregate({
                    _sum: { amountPaid: true },
                    where: { paymentDate: { gte: start, lte: end } }
                });

                revenueData.push({
                    name: `Week ${format(start, 'w')}`,
                    revenue: Number(weeklyRevenue._sum.amountPaid || 0)
                });
            }
        } else if (period === 'YEARLY') {
            // Last 5 years
            for (let i = 4; i >= 0; i--) {
                const date = subYears(now, i);
                const start = startOfYear(date);
                const end = endOfYear(date);

                const yearlyRevenue = await prisma.paymentReceipts.aggregate({
                    _sum: { amountPaid: true },
                    where: { paymentDate: { gte: start, lte: end } }
                });

                revenueData.push({
                    name: format(date, 'yyyy'),
                    revenue: Number(yearlyRevenue._sum.amountPaid || 0)
                });
            }
        } else {
            // MONTHLY (Default) - Last 6 months
            for (let i = 5; i >= 0; i--) {
                const date = subMonths(now, i);
                const start = startOfMonth(date);
                const end = endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));

                const monthlyRevenue = await prisma.paymentReceipts.aggregate({
                    _sum: { amountPaid: true },
                    where: { paymentDate: { gte: start, lte: end } }
                });

                revenueData.push({
                    name: format(date, 'MMM'),
                    revenue: Number(monthlyRevenue._sum.amountPaid || 0)
                });
            }
        }

        // 2. Total Stats
        const totalStudents = await prisma.user.count({ where: { roleId: { not: null } } });
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

        const enrichedPopularCourses = (await Promise.all(popularCourses.map(async (item: any) => {
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
    },
    ['admin-analytics'],
    { revalidate: 3600, tags: ['analytics'] }
);

export async function getAdminAnalytics(period: TrendPeriod = 'MONTHLY') {
    const session = await auth();
    // In real app, check admin role
    if (!session?.user?.id) return null;

    return getCachedAdminAnalyticsData(period);
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

const getCachedDashboardMetricsData = unstable_cache(
    async (period: TrendPeriod) => {
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
                previousEnd = subMonths(currentEnd, 1);
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
    },
    ['dashboard-metrics'],
    { revalidate: 3600, tags: ['analytics'] }
);

export async function getDashboardMetrics(period: TrendPeriod = 'MONTHLY') {
    const session = await auth();
    return getCachedDashboardMetricsData(period);
}

export async function getLeadAnalytics(branchId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // await requirePermission("read", "marketing"); // Or general admin access

  const where: any = {};
  if (branchId) {
    where.branchId = branchId;
  }

  // 1. Leads by Count per Status
  const statusCounts = await prisma.lead.groupBy({
    by: ['status'],
    where,
    _count: { status: true }
  });

  // 2. Conversion Ratio (CONVERTED / Total)
  const totalLeads = statusCounts.reduce((acc, curr) => acc + curr._count.status, 0);
  const convertedLeads = statusCounts.find(s => s.status === 'CONVERTED')?._count.status || 0;

  const conversionRatio = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // 3. Leads by Source
  const sourceCounts = await prisma.lead.groupBy({
     by: ['source'],
     where,
     _count: { source: true }
  });

  return {
    statusDistribution: statusCounts.map(s => ({ name: s.status, value: s._count.status })),
    sourceDistribution: sourceCounts.map(s => ({ name: s.source, value: s._count.source })),
    conversionRatio: Math.round(conversionRatio * 100) / 100,
    totalLeads,
    convertedLeads
  };
}
