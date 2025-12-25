
import { UserActions } from "@/components/admin/UserActions";
import { UserInviteDialog } from "@/components/admin/UserInviteDialog";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Mail, Phone, Shield } from "lucide-react";

export default async function AdminUsersPage() {
  await requirePermission('manage', 'user');
  const users = await prisma.user.findMany({
    include: {
      studentProfile: true,
      teacherProfile: true,
      role: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users & Staff</h1>
          <p className="text-text-muted">Manage all platform users</p>
        </div>
        <UserInviteDialog />
      </div>

      <div className="bg-accent/10 rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/20">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-muted">User</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Role</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Joined</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Status</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-t border-border hover:bg-accent/10">
                  <td className="p-4">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-xs text-text-muted">ID: {user.id.slice(-6)}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Mail size={14} className="text-text-muted" /> {user.email}
                    </div>
                    {(user.phone) && (
                      <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
                        <Phone size={14} /> {user.phone}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                        ${user.role?.name === 'ADMIN' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : ''}
                        ${user.role?.name === 'TEACHER' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                        ${user.role?.name === 'STUDENT' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        ${!['ADMIN', 'TEACHER', 'STUDENT'].includes(user.role?.name || '') ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' : ''}
                    `}>
                      <Shield size={12} />
                      {user.role?.name || 'NO ROLE'}
                    </div>
                  </td>
                  <td className="p-4 text-text-muted text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-accent px-2 py-1 rounded">Active</span>
                  </td>
                  <td className="p-4">
                    <UserActions userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
