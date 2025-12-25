import { getTeacherAnalytics } from "@/app/actions/analytics";
import { auth } from "@/auth";
import StatCard from "@/components/Analytics/StatCard";
import { BookOpen, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const analytics = await getTeacherAnalytics();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Teacher Portal</h1>
        <p className="text-text-muted">Welcome back, {session.user.name}</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            title="Total Active Students"
            value={analytics.overview.totalStudents}
            icon={Users}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Active Batches"
            value={analytics.overview.activeBatches}
            icon={Users}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Assigned Courses"
            value={analytics.overview.activeCourses}
            icon={BookOpen}
            trend="neutral"
            trendValue=""
          />
        </div>
      )}

      {/* Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Upcoming Classes
          </h3>
          <div className="space-y-4">
            {analytics?.upcomingClasses.length === 0 ? (
              <p className="text-text-muted">No upcoming classes scheduled.</p>
            ) : (
              analytics?.upcomingClasses.map((cls: any) => (
                <div key={cls.id} className="flex items-center gap-4 p-3 rounded-lg bg-accent/30 border border-border">
                  <div className="flex-col flex items-center justify-center w-12 h-12 bg-background rounded-lg border border-border shrink-0">
                    <span className="text-xs font-bold uppercase text-red-500">
                      {new Date(cls.startTime).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {new Date(cls.startTime).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{cls.title}</h4>
                    <p className="text-xs text-text-muted truncate">
                      {cls.courseTitle} • {cls.batchName}
                    </p>
                  </div>
                  <div className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                    {new Date(cls.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <Link href="/teacher/schedule" className="text-sm font-medium text-primary hover:underline">
              View Full Schedule →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-accent/10 border border-primary/20 p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/teacher/assignments/new" className="p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-all text-center">
                <span className="block font-bold">Create Assignment</span>
              </Link>
              <Link href="/teacher/schedule" className="p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-all text-center">
                <span className="block font-bold">Schedule Class</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
