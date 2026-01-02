import { getAllLeaveRequests } from "@/app/actions/leaves";
import { auth } from "@/auth";
import { AdminLeaveTable } from "@/components/admin/AdminLeaveTable";
import { requirePermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function AdminLeavePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await requirePermission("read", "user");

  const leaves = await getAllLeaveRequests();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <p className="text-text-muted">Approve or reject staff and teacher leave requests</p>
      </div>

      <AdminLeaveTable leaves={leaves as any} />
    </div>
  );
}
