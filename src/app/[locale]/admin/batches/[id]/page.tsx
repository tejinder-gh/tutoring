
import { updateBatch } from "@/lib/actions/batches";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calculator, Save } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
// Define the FeeFrequency type locally if not available from client yet,
// though it should be available at runtime.
type FeeFrequency = "ONE_TIME" | "MONTHLY";

export default async function BatchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      _count: {
        select: { students: true },
      },
    },
  });

  if (!batch) {
    notFound();
  }

  // Cost Analysis Calculation
  const totalNoOfParticipants = batch._count.students;
  const fee = Number(batch.fee);
  const teacherCompensation = Number(batch.teacherCompensation);
  const teacherCommission = Number(batch.teacherCommission);
  const monthlyOverHeadCost = Number(batch.monthlyOverHeadCost);

  const start = new Date(batch.startDate);
  // Default to 1 month if no end date or start=end, to avoid 0 division or weirdness
  // If end date is present, calculate months.
  let durationInMonths = 1;
  if (batch.endDate) {
    const end = new Date(batch.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    durationInMonths = Math.max(1, Math.ceil(diffDays / 30));
  }

  // Calculate fee recurrence
  const feeRecurrence = batch.feeFrequency === "MONTHLY" ? durationInMonths : 1;

  // Formula:
  // (totalNoOfParticipants * fee) * feeFrequency - teacherCompensation - totalNoOfParticipants * teacherCommission - monthyoverHeadCost * batchDuration

  const totalRevenue = (totalNoOfParticipants * fee) * feeRecurrence;
  const totalTeacherCommission = totalNoOfParticipants * teacherCommission;
  const totalOverhead = monthlyOverHeadCost * durationInMonths;

  const totalCost = teacherCompensation + totalTeacherCommission + totalOverhead;
  const netProfit = totalRevenue - totalCost;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/admin/batches"
          className="flex items-center gap-2 text-text-muted hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Batches
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Manage Batch: {batch.name}</h1>
        <p className="text-text-muted">Edit batch details and view cost analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-accent/10 border border-border rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Edit Details</h2>
            <form action={updateBatch.bind(null, batch.id)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={batch.name}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={batch.startDate.toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={batch.endDate ? batch.endDate.toISOString().split("T")[0] : ""}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground">Financials</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Batch Fee
                    </label>
                    <input
                      type="number"
                      name="fee"
                      defaultValue={Number(batch.fee)}
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Fee Frequency
                    </label>
                    <select
                      name="feeFrequency"
                      defaultValue={batch.feeFrequency}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="ONE_TIME">One Time</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Teacher Compensation (Fixed)
                    </label>
                    <input
                      type="number"
                      name="teacherCompensation"
                      defaultValue={Number(batch.teacherCompensation)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Teacher Commission (Per Student)
                    </label>
                    <input
                      type="number"
                      name="teacherCommission"
                      defaultValue={Number(batch.teacherCommission)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Monthly Overhead Cost
                    </label>
                    <input
                      type="number"
                      name="monthlyOverHeadCost"
                      defaultValue={Number(batch.monthlyOverHeadCost)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Update Batch
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Cost Analysis */}
        <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-foreground">Cost Analysis</h2>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-accent/5 rounded-lg border border-border">
              <div className="text-sm text-text-muted mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-foreground">
                ₹{totalRevenue.toFixed(2)}
              </div>
              <div className="text-xs text-text-muted mt-1">
                {totalNoOfParticipants} Students × ₹{fee} × {feeRecurrence} {batch.feeFrequency === "MONTHLY" ? "months" : "payment"}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Teacher Compensation</span>
                <span className="text-foreground font-medium">₹{teacherCompensation.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Teacher Commission</span>
                <span className="text-foreground font-medium">₹{totalTeacherCommission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Overhead Cost ({durationInMonths}m)</span>
                <span className="text-foreground font-medium">₹{totalOverhead.toFixed(2)}</span>
              </div>

              <div className="h-px bg-border my-2"></div>

              <div className="flex justify-between text-base font-semibold">
                <span className="text-foreground">Total Cost</span>
                <span className="text-red-400">₹{totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${netProfit >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
              <div className="text-sm text-text-muted mb-1">Net Profit/Loss</div>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                ₹{netProfit.toFixed(2)}
              </div>
            </div>

            <div className="text-xs text-text-muted italic mt-4">
              * Formula: (Participants × Fee × Freq) - Compensation - (Participants × Commission) - (Overhead × Duration)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
