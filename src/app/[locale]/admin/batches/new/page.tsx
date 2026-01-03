
import { createBatch } from "@/lib/actions/batches";
import { db } from "@/lib/db";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default async function NewBatchPage() {
  const courses = await db.course.findMany({
    select: { id: true, title: true },
  });

  if (courses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-2">No Courses Found</h2>
          <p>You need to create a course before you can create a batch.</p>
          <Link href="/admin/courses" className="inline-block mt-4 text-sm underline hover:text-red-400">
            Go to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin/batches"
          className="flex items-center gap-2 text-text-muted hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Batches
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Create New Batch</h1>
        <p className="text-text-muted">Launch a new cohort for a course</p>
      </div>

      <div className="bg-accent/10 border border-border rounded-xl p-6 sm:p-8">
        <form action={createBatch} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Batch Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Jan 2025 Regular"
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Course
            </label>
            <select
              name="courseId"
              required
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
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
              Create Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
