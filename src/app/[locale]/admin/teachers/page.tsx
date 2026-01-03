import { db } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const teachers = await db.teacherProfile.findMany({
    include: {
      user: true,
      _count: {
        select: { courses: true }
      }
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-text-muted">Manage teachers and faculty.</p>
        </div>
        <Link
          href="/admin/teachers/new"
          className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          Add Teacher
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(teacher => (
          <div
            key={teacher.id}
            className="bg-accent/20 border border-border p-6 rounded-xl hover:border-primary/50 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                {teacher.user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{teacher.user.name}</h3>
                <p className="text-sm text-text-muted">{teacher.user.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Domain</span>
                <span className="font-medium">{teacher.domain || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Assigned Courses</span>
                <span className="font-medium">{teacher._count.courses}</span>
              </div>
            </div>
          </div>
        ))}

        {teachers.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted border border-dashed border-border rounded-xl">
            <p>No teachers found. Invite your first teacher.</p>
          </div>
        )}
      </div>
    </div>
  );
}
