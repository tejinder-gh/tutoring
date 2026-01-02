import { getAuditLogs } from "@/app/actions/audit";
import { auth } from "@/auth";
import { AuditLogTable } from "@/components/admin/AuditLogTable";

export default async function AuditPage({ searchParams }: { searchParams: { page?: string } }) {
  const session = await auth();
  if (!session?.user) return <div>Unauthorized</div>;

  // await requirePermission("read", "system"); // or admin check

  const page = Number(searchParams?.page) || 1;
  const { logs, total, totalPages } = await getAuditLogs(page);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <p className="text-text-muted">Track system security and changes</p>
      </div>

      <AuditLogTable
        initialLogs={logs}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
      />
    </div>
  );
}
