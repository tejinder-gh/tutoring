import {
  getBatchProfitability,
  getFinanceOverview,
  getPendingSalaries,
  getRecentPayments,
  getRevenueTrends,
} from "@/app/actions/admin-finance";
import { auth } from "@/auth";
import { SimpleBarChart, SimpleLineChart } from "@/components/Analytics/Charts";
import StatCard from "@/components/Analytics/StatCard";
import { requirePermission } from "@/lib/permissions";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeIndianRupee,
  Calculator,
  CreditCard,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const session = await auth();
  if (!session?.user) return <div>Unauthorized</div>;

  await requirePermission("read", "finance");

  const [overview, payments, salaries, profitability, trends] =
    await Promise.all([
      getFinanceOverview(),
      getRecentPayments(1, 10),
      getPendingSalaries(),
      getBatchProfitability(),
      getRevenueTrends(6),
    ]);

  const unpaidSalaries = salaries.filter((s) => !s.paidThisMonth);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Finance Dashboard
          </h1>
          <p className="text-text-muted">
            Revenue, payments, and salary management
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${overview.totalRevenue.toLocaleString()}`}
          icon={BadgeIndianRupee}
          trend="neutral"
        />
        <StatCard
          title="This Month"
          value={`₹${overview.thisMonthRevenue.toLocaleString()}`}
          icon={TrendingUp}
          trend="up"
          trendValue="Current"
        />
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-500">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm text-text-muted">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-500">
                ₹{overview.pendingPayments.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            {overview.pendingPaymentsCount} students with pending dues
          </p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-text-muted">Pending Salaries</p>
              <p className="text-2xl font-bold text-purple-500">
                ₹{overview.pendingSalaries.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            {overview.pendingSalariesCount} employees awaiting payment
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-6">Revenue Trend (6 Months)</h3>
          <div className="h-64">
            <SimpleLineChart
              data={trends}
              xKey="month"
              yKey="revenue"
              color="#10B981"
            />
          </div>
        </div>

        {/* Batch Profitability */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-6">Batch Profitability</h3>
          <div className="h-64">
            <SimpleBarChart
              data={profitability.slice(0, 5).map((b) => ({
                name: b.batchName,
                profit: b.profit,
              }))}
              xKey="name"
              yKey="profit"
              color="#8B5CF6"
            />
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-lg">Recent Payments</h3>
            <span className="text-xs text-text-muted">
              {payments.total} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/30 text-text-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Course</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-accent/10">
                    <td className="p-3">
                      <div className="font-medium">{payment.user.name}</div>
                      <div className="text-xs text-text-muted">
                        {payment.user.email}
                      </div>
                    </td>
                    <td className="p-3 text-text-muted">
                      {payment.course?.title || "N/A"}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-green-500 font-bold">
                        ₹{payment.amountPaid.toLocaleString()}
                      </span>
                      {payment.pendingAmount > 0 && (
                        <span className="block text-xs text-yellow-500">
                          ₹{payment.pendingAmount.toLocaleString()} pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-text-muted text-xs">
                      {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
                {payments.payments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-muted">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Salaries */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-lg">Pending Salaries (This Month)</h3>
            <span className="text-xs text-text-muted">
              {unpaidSalaries.length} pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/30 text-text-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Employee</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-right p-3 font-medium">Net Salary</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {salaries.slice(0, 10).map((salary) => (
                  <tr key={salary.id} className="hover:bg-accent/10">
                    <td className="p-3">
                      <div className="font-medium">{salary.employee.name}</div>
                      <div className="text-xs text-text-muted">
                        {salary.employee.department}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${salary.employee.type === "TEACHER"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-green-500/10 text-green-500"
                          }`}
                      >
                        {salary.employee.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold">
                      ₹{salary.netSalary.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      {salary.paidThisMonth ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                          <ArrowUpRight size={12} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                          <ArrowDownRight size={12} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {salaries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-muted">
                      No salary records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Batch Profitability Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator className="text-primary" size={20} />
            <h3 className="font-bold text-lg">Batch Cost Analysis</h3>
          </div>
          <Link href="/admin/batches" className="text-sm text-primary hover:underline">
            Manage Batches →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/30 text-text-muted">
              <tr>
                <th className="text-left p-3 font-medium">Batch</th>
                <th className="text-left p-3 font-medium">Course</th>
                <th className="text-center p-3 font-medium">
                  <Users size={14} className="inline mr-1" />
                  Students
                </th>
                <th className="text-right p-3 font-medium">Fee</th>
                <th className="text-right p-3 font-medium">Revenue</th>
                <th className="text-right p-3 font-medium">Costs</th>
                <th className="text-right p-3 font-medium">Profit</th>
                <th className="text-right p-3 font-medium">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profitability.map((batch) => (
                <tr key={batch.batchId} className="hover:bg-accent/10">
                  <td className="p-3 font-medium">{batch.batchName}</td>
                  <td className="p-3 text-text-muted">{batch.courseName}</td>
                  <td className="p-3 text-center">{batch.enrolledStudents}</td>
                  <td className="p-3 text-right text-text-muted">
                    ₹{batch.fee.toLocaleString()}
                    <span className="text-xs ml-1">
                      /{batch.feeFrequency === "MONTHLY" ? "mo" : "one-time"}
                    </span>
                  </td>
                  <td className="p-3 text-right text-green-500 font-medium">
                    ₹{batch.revenue.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-red-500">
                    ₹{batch.costs.toLocaleString()}
                  </td>
                  <td
                    className={`p-3 text-right font-bold ${batch.profit >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                  >
                    ₹{batch.profit.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${batch.profitMargin >= 30
                          ? "bg-green-500/10 text-green-500"
                          : batch.profitMargin >= 10
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                    >
                      {batch.profitMargin}%
                    </span>
                  </td>
                </tr>
              ))}
              {profitability.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted">
                    No active batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
