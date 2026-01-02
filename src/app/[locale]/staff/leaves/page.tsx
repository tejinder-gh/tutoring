import { getMyLeaves } from "@/app/actions/leaves";
import { auth } from "@/auth";
import { LeaveHistoryTable } from "@/components/Leaves/LeaveHistoryTable";
import { LeaveRequestDialog } from "@/components/Leaves/LeaveRequestDialog";
import { redirect } from "next/navigation";

export default async function StaffLeavesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const leaves = await getMyLeaves();

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Leaves</h1>
          <p className="text-text-muted">Manage your leave requests and history</p>
        </div>
        <LeaveRequestDialog />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Leave History</h2>
        <LeaveHistoryTable leaves={leaves} />
      </div>
    </div>
  );
}
