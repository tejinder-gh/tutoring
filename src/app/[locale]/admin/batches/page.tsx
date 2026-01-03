
import { db } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminBatchesPage() {
  const batches = await db.batch.findMany({
    include: {
      course: true,
      _count: {
        select: { students: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Batches</h1>
          <p className="text-text-muted">Manage academic batches and enrollments</p>
        </div>
        <Link
          href="/admin/batches/new"
          className="bg-primary text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={20} />
          Create Batch
        </Link>
      </div>

      <div className="bg-accent/10 rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/20">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Batch Name</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Course</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Students</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Start Date</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">End Date</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    No batches found. Create one to get started.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="border-t border-border hover:bg-accent/10">
                    <td className="p-4 text-foreground font-medium">{batch.name}</td>
                    <td className="p-4 text-foreground">{batch.course.title}</td>
                    <td className="p-4 text-foreground">{batch._count.students}</td>
                    <td className="p-4 text-text-muted">
                      {new Date(batch.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-text-muted">
                      {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "Ongoing"}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/batches/${batch.id}`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Manage
                      </Link>
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
