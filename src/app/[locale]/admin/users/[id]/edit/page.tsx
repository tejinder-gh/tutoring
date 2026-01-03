import { updateUser } from "@/app/actions/user";
import { auth } from "@/auth";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import { ArrowLeft, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const session = await auth();
  // In real app use requirePermission, here manual check or rely on action
  if (!session?.user) redirect("/auth/login");

  const user = await db.user.findUnique({
    where: { id: params.id },
    include: { branch: true, role: true }
  });

  if (!user) notFound();

  const branches = await db.branch.findMany();

  async function updateAction(formData: FormData) {
    "use server";
    await updateUser(user!.id, formData);
    redirect("/admin/users");
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Edit User: {user.name}</h1>
      </div>

      <form action={updateAction} className="space-y-6 bg-card border rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              name="name"
              defaultValue={user.name || ""}
              required
              className="w-full border rounded-md px-3 py-2 bg-background"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              defaultValue={user.email || ""}
              required
              type="email"
              className="w-full border rounded-md px-3 py-2 bg-background"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <input
              name="phone"
              defaultValue={user.phone || ""}
              className="w-full border rounded-md px-3 py-2 bg-background"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <input
              disabled
              value={user.role?.name || "N/A"}
              className="w-full border rounded-md px-3 py-2 bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Role cannot be changed yet.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Branch Assignment</label>
          <select
            name="branchId"
            defaultValue={user.branchId || "none"}
            className="w-full border rounded-md px-3 py-2 bg-background"
          >
            <option value="none">No Branch (Global)</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Assigning a branch restricts visibility for some roles.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            defaultChecked={user.isActive}
            className="rounded border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm font-medium">Active Account</label>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
