import { auth } from '@/auth';
import { SimpleBarChart, SimpleLineChart } from '@/components/Analytics/Charts';
import StatCard from '@/components/Analytics/StatCard';
import { Link } from '@/i18n/routing';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/permissions';
import { BadgeIndianRupee, Filter, GraduationCap, Users } from 'lucide-react';
import type { TrendPeriod } from '../../actions/analytics';
import { getAdminAnalytics, getDashboardMetrics, getLeadAnalytics } from '../../actions/analytics';


export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: { period?: string; branchId?: string } }) {
  await requirePermission('read', 'user');
  const session = await auth();

  const period: TrendPeriod = (searchParams.period as TrendPeriod) || 'MONTHLY';
  const branchId = searchParams.branchId;

  const [leads, students, analytics, dashboardMetrics, leadAnalytics, auditLogs, branches] = await Promise.all([
    db.lead.findMany({
      where: branchId ? { branchId } : {},
      orderBy: { createdAt: 'desc' },
      include: { branch: true }
    }),
    db.user.findMany({
      where: {
        role: { name: 'STUDENT' },
        ...(branchId ? { branchId } : {})
      },
      include: { studentProfile: true, role: true, branch: true },
      orderBy: { createdAt: 'desc' },
    }),
    getAdminAnalytics(period),
    getDashboardMetrics(period),
    getLeadAnalytics(branchId),
    db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    }),
    db.branch.findMany()
  ]);

  const periods: { label: string; value: TrendPeriod }[] = [
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Bi-Weekly', value: 'BIWEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Yearly', value: 'YEARLY' },
  ];

  const chartTitle = {
    DAILY: 'Revenue Trend (Last 7 Days)',
    WEEKLY: 'Revenue Trend (Last 4 Weeks)',
    BIWEEKLY: 'Revenue Trend (Last 14 Days)',
    MONTHLY: 'Revenue Trend (Last 6 Months)',
    YEARLY: 'Revenue Trend (Last 5 Years)',
  }[period];

  const trendColor = dashboardMetrics?.revenue.trend === 'up' ? '#10B981' :
    dashboardMetrics?.revenue.trend === 'down' ? '#EF4444' : '#F59E0B';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-text-muted">Welcome back, {session?.user?.name}</p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-accent/10 p-1 rounded-lg border border-border">
          {periods.map((p) => (
            <Link
              key={p.value}
              href={`/admin?period=${p.value}`}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${period === p.value
                ? 'bg-primary text-black shadow-sm'
                : 'text-text-muted hover:text-foreground'
                }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Branch Selector */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Branch:</span>
          <div className="flex gap-2">
            <Link
              href={`/admin?period=${period}`}
              className={`text-sm hover:underline ${!branchId ? 'font-bold text-primary' : 'text-muted-foreground'}`}
            >
              All
            </Link>
            {branches.map(b => (
              <Link
                key={b.id}
                href={`/admin?period=${period}&branchId=${b.id}`}
                className={`text-sm hover:underline ${branchId === b.id ? 'font-bold text-primary' : 'text-muted-foreground'}`}
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-muted-foreground font-medium mb-1">Lead Conversion</div>
          <div className="text-3xl font-bold">{leadAnalytics.conversionRatio}%</div>
          <div className="text-xs text-muted-foreground mt-2">
            {leadAnalytics.convertedLeads} converted / {leadAnalytics.totalLeads} total
          </div>
        </div>
        {leadAnalytics.statusDistribution.slice(0, 3).map(stat => (
          <div key={stat.name} className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="text-sm text-muted-foreground font-medium mb-1">{stat.name} Leads</div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Link href="/admin/finance" className="block transition-transform hover:scale-[1.02]">
          <StatCard
            title="Total Revenue"
            value={`₹${analytics?.overview.totalRevenue.toLocaleString()}`}
            icon={BadgeIndianRupee}
            trend={dashboardMetrics?.revenue.trend}
            trendValue={`${dashboardMetrics?.revenue.change}%`}
            trendLabel={`vs prev ${period.toLowerCase()}`}
          />
        </Link>
        <Link href="/admin/leads" className="block transition-transform hover:scale-[1.02]">
          <StatCard
            title="Total Leads"
            value={leads.length}
            icon={Users}
            trend={dashboardMetrics?.leads.trend}
            trendValue={`${dashboardMetrics?.leads.change}%`}
            trendLabel={`vs prev ${period.toLowerCase()}`}
          />
        </Link>
        <Link href="/admin/users?role=student" className="block transition-transform hover:scale-[1.02]">
          <StatCard
            title="Total Students"
            value={students.length}
            icon={GraduationCap}
            trend={dashboardMetrics?.enrollments.trend}
            trendValue={`${dashboardMetrics?.enrollments.change}%`}
            trendLabel={`vs prev ${period.toLowerCase()}`}
          />
        </Link>

        <Link href="/admin/courses" className="block transition-transform hover:scale-[1.02]">
          <div className="bg-primary/10 rounded-xl p-6 border border-primary/30 h-full flex flex-col justify-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {coursesCount(analytics?.overview.totalCourses)}
            </div>
            <div className="text-text-muted">Total Courses</div>
          </div>
        </Link>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-6">{chartTitle}</h3>
            <div className="h-64">
              <SimpleLineChart data={analytics.revenueData} xKey="name" yKey="revenue" color={trendColor} />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-6">Popular Courses</h3>
            <div className="h-64">
              <SimpleBarChart data={analytics.popularCourses} xKey="name" yKey="students" color="#3B82F6" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Feed (Audit Log) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-12">
        <h3 className="text-lg font-bold mb-6">Recent System Activity</h3>
        <div className="space-y-6">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-text-muted">No recent activity found.</p>
          ) : (
            auditLogs.map((log: any) => (
              <div key={log.id} className="flex gap-4 items-start">
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${log.action === 'PAYMENT' ? 'bg-green-500' :
                  log.action === 'DELETE' ? 'bg-red-500' :
                    log.action === 'UPDATE' ? 'bg-yellow-500' :
                      'bg-blue-500'
                  }`} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {log.action} on {log.entity} by <span className="font-bold">{log.user.name || log.user.email}</span>
                  </p>
                  <p className="text-sm text-foreground/80 my-1">
                    {(log.newValue as any)?.details || "No details provided"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-accent/10 rounded-xl border border-border overflow-hidden mb-12">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Recent Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/20">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Name</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Email</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Status</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                leads.slice(0, 20).map((lead: any) => (
                  <tr key={lead.id} className="border-t border-border hover:bg-accent/10">
                    <td className="p-4 text-foreground font-medium">{lead.name}</td>
                    <td className="p-4 text-foreground">{lead.phone}</td>
                    <td className="p-4 text-foreground">{lead.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted text-sm">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-accent/10 rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Registered Students</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/20">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Name</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Email</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Role</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Joined</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    No students enrolled yet.
                  </td>
                </tr>
              ) : (
                students.slice(0, 20).map((student: any) => (
                  <tr key={student.id} className="border-t border-border hover:bg-accent/10">
                    <td className="p-4 text-foreground font-medium">{student.name}</td>
                    <td className="p-4 text-foreground">{student.email}</td>
                    <td className="p-4 text-foreground">{student.phone || 'N/A'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                        {student.role?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted text-sm">
                      {new Date(student.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function coursesCount(count?: number) {
  return count || 0;
}
