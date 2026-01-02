import { getAllLeaveRequests } from "@/app/actions/leaves";
import { auth } from "@/auth";
import { AdminLeaveTable } from "@/components/admin/AdminLeaveTable";
import { requirePermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function AdminLeavePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; role?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await requirePermission("read", "user");

  const { status, role } = await searchParams;

  const leaves = await getAllLeaveRequests({
    status: status as any,
    role: role,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-text-muted">Approve or reject staff and teacher leave requests</p>
        </div>
      </div>

      {/* Filter Section - Simple implementation using Links or a client component */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          <span className="text-sm font-medium self-center">Status:</span>
          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
              <a
                key={s}
                href={`/admin/leaves?status=${s}${role ? `&role=${role}` : ''}`}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${status === s ? 'bg-primary/20 border-primary' : 'bg-background border-border hover:bg-accent'}`}
              >
                {s}
              </a>
            ))}
            {status && (
              <a href={`/admin/leaves${role ? `?role=${role}` : ''}`} className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">Clear</a>
            )}
          </div>
        </div>
      </div>

      <AdminLeaveTable leaves={leaves as any} />
    </div>
  );
}
