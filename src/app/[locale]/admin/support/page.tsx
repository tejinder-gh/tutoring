import { auth } from "@/auth";
import { QueryList } from "@/components/Support/QueryList"; // We will create this
import { getAdminQueries } from "@/lib/actions/communication"; // We will add this
import { requirePermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await requirePermission("read", "user"); // or generic admin check

  const queries = await getAdminQueries();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Support & Helpdesk</h1>
          <p className="text-text-muted">Manage student queries and tickets</p>
        </div>
      </div>

      <QueryList initialQueries={queries} />
    </div>
  );
}
