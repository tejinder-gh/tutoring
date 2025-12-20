import { getStudentAnalytics } from "@/app/actions/analytics";
import { auth } from "@/auth";
import { SimpleBarChart } from "@/components/Analytics/Charts";
import StatCard from "@/components/Analytics/StatCard";
import ProgressBar from "@/components/ProgressBar";
import { getEnrolledCourses } from "@/lib/actions/progress";
import { prisma } from "@/lib/prisma";
import { Award, BookOpen, Clock, GraduationCap } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function StudentDashboard() {
    const session = await auth();
    if (!session?.user) return <div>Unauthorized</div>;

    const [profile, announcements, enrolledCourses, analytics] = await Promise.all([
        prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                batch: { include: { course: true } }
            }
        }),
        prisma.announcement.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { name: true } } }
        }),
        getEnrolledCourses(),
        getStudentAnalytics()
    ]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome back, {session.user.name}</h1>
                {profile?.batch && (
                    <p className="text-text-muted mt-2">
                        Enrolled in: <span className="text-primary font-semibold">{profile.batch.course.title}</span> ({profile.batch.name})
                    </p>
                )}
            </div>

            {/* Analytics Overview */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Completed Courses"
                        value={analytics.overview.completedCourses}
                        icon={Award}
                        trend="neutral"
                    />
                    <StatCard
                        title="Active Courses"
                        value={analytics.overview.activeCourses}
                        icon={BookOpen}
                        trend="neutral"
                    />
                    <StatCard
                        title="Attendance"
                        value={`${analytics.overview.attendanceRate}%`}
                        icon={Clock}
                        trend="neutral"
                    />
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                        <p className="text-sm font-medium text-slate-500 mb-2">Quiz Performance</p>
                        <div className="h-24">
                            <SimpleBarChart
                                data={analytics.recentQuizScores}
                                xKey="name"
                                yKey="score"
                                color="#8B5CF6"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Continue Learning Section */}
            {enrolledCourses.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <GraduationCap className="text-primary" size={24} />
                            Continue Learning
                        </h2>
                        <Link href="/student/learn" className="text-sm text-primary hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {enrolledCourses.slice(0, 2).map((course: any) => (
                            <Link
                                key={course.id}
                                href={`/student/learn/${course.courseId}`}
                                className="p-5 bg-accent/20 border border-border rounded-xl hover:border-primary/50 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-black transition-colors">
                                        <BookOpen size={24} className="text-primary group-hover:text-black" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                            {course.courseTitle}
                                        </h3>
                                        <p className="text-sm text-text-muted mt-1">
                                            {course.completedLessons}/{course.totalLessons} lessons
                                        </p>
                                        <div className="mt-3">
                                            <ProgressBar value={course.progressPercent} size="sm" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-accent/20 border border-border p-6 rounded-xl">
                    <h3 className="font-bold text-xl mb-4">Latest Announcements</h3>
                    <div className="space-y-4">
                        {announcements.map((ann: any) => (
                            <div key={ann.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                                <h4 className="font-semibold">{ann.title}</h4>
                                <p className="text-sm text-text-muted mt-1">{ann.content}</p>
                                <p className="text-xs text-text-muted mt-2">Posted by {ann.author.name}</p>
                            </div>
                        ))}
                        {announcements.length === 0 && <p className="text-text-muted">No announcements yet.</p>}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/student/learn" className="bg-primary/20 border border-primary/30 p-6 rounded-xl flex flex-col items-center justify-center hover:bg-primary/30 transition-all">
                        <span className="text-2xl font-bold mb-1">My Learning</span>
                        <span className="text-xs text-text-muted">View Courses</span>
                    </Link>
                    <Link href="/student/assignments" className="bg-accent/30 border border-border p-6 rounded-xl flex flex-col items-center justify-center hover:bg-accent/50 transition-all">
                        <span className="text-2xl font-bold mb-1">Assignments</span>
                        <span className="text-xs text-text-muted">View Pending</span>
                    </Link>
                    <Link href="/student/queries" className="bg-secondary/20 border border-secondary/30 p-6 rounded-xl flex flex-col items-center justify-center hover:bg-secondary/30 transition-all col-span-2">
                        <span className="text-2xl font-bold mb-1">Support</span>
                        <span className="text-xs text-text-muted">Ask Query</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
