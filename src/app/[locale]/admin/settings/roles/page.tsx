import { RoleList } from "@/components/admin/RoleList";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function RolesPage() {
  await requirePermission("manage", "settings");

  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: {
        select: { users: true }
      }
    },
    orderBy: {
      isSystem: 'desc' // System roles first
    }
  });

  const allPermissions = await prisma.permission.findMany({
    orderBy: [
      { subject: 'asc' },
      { action: 'asc' }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-text-muted">Configure access control for the platform</p>
        </div>
      </div>

      <RoleList roles={roles} permissions={allPermissions} />
    </div>
  );
}
