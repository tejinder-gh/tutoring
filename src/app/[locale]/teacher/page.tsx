import { getTeacherAnalytics } from "@/app/actions/analytics";
import { auth } from "@/auth";
import StatCard from "@/components/Analytics/StatCard";
import { ArrowRight, BookOpen, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const analytics = await getTeacherAnalytics();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Portal</h1>
          <p className="text-text-muted mt-1">Welcome back, {session.user.name}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/teacher/communication" className="px-4 py-2 bg-accent hover:bg-accent/80 text-foreground rounded-lg font-medium transition-colors border border-border">
            Announcements
          </Link>
          <Link href="/teacher/schedule" className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg font-medium transition-colors shadow-sm">
            View Schedule
          </Link>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Classes - Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-primary" size={24} />
              Upcoming Classes
            </h2>
            <Link href="/teacher/schedule" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              Full Schedule <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {analytics?.upcomingClasses.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-accent/5">
                <p className="text-text-muted">No upcoming classes scheduled.</p>
              </div>
            ) : (
              analytics?.upcomingClasses.map((cls: any) => (
                <div key={cls.id} className="p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-all group shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="flex-col flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl border border-primary/10 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="text-xs font-bold uppercase opacity-80">
                        {new Date(cls.startTime).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold leading-none">
                        {new Date(cls.startTime).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{cls.title}</h4>
                      <p className="text-sm text-text-muted truncate">
                        {cls.courseTitle} • <span className="font-medium text-foreground">{cls.batchName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono bg-accent px-3 py-1 rounded-lg border border-border">
                        {new Date(cls.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/teacher/assignments/new" className="p-4 bg-accent/30 border border-border rounded-xl hover:bg-accent/50 hover:border-primary/30 transition-all flex items-center gap-3 group">
              <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                <BookOpen size={20} />
              </div>
              <span className="font-semibold">Create Assignment</span>
            </Link>
            <Link href="/teacher/leaves" className="p-4 bg-accent/30 border border-border rounded-xl hover:bg-accent/50 hover:border-primary/30 transition-all flex items-center gap-3 group">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <span className="font-semibold">Request Leave</span>
            </Link>
            <Link href="/teacher/profile" className="p-4 bg-accent/30 border border-border rounded-xl hover:bg-accent/50 hover:border-primary/30 transition-all flex items-center gap-3 group">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="font-semibold">My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
