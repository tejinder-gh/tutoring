import { getPendingPayroll } from "@/app/actions/finance";
import { auth } from "@/auth";
import type { PayrollEntry } from "@/components/Finance/PayrollTable";
import { PayrollTable } from "@/components/Finance/PayrollTable";
import { requirePermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function PayrollPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await requirePermission("read", "finance");

  const payroll = await getPendingPayroll();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll Management</h1>
        <p className="text-text-muted">Process salary payments for teachers and staff</p>
      </div>

      <PayrollTable payroll={payroll as PayrollEntry[]} />
    </div>
  );
}
