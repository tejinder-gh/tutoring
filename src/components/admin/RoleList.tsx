"use client";

import { deleteRole } from "@/lib/actions/roles";
import { Permission, Role } from "@prisma/client";
import { Edit, Plus, Shield, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { RoleEditor } from "./RoleEditor";

type RoleWithCounts = Role & {
  permissions: Permission[];
  _count: { users: number };
};

type Props = {
  roles: RoleWithCounts[];
  permissions: Permission[];
};

export function RoleList({ roles, permissions }: Props) {
  const [editingRole, setEditingRole] = useState<RoleWithCounts | null | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role? This action cannot be undone.")) return;

    const result = await deleteRole(roleId);
    if (result.error) {
      alert(result.error);
    }
  };

  if (editingRole !== undefined || isCreating) {
    return (
      <div className="bg-card p-6 rounded-xl border">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{isCreating ? "Create New Role" : `Edit ${editingRole?.name}`}</h2>
        </div>
        <RoleEditor
          role={editingRole || undefined}
          allPermissions={permissions}
          onClose={() => {
            setEditingRole(undefined);
            setIsCreating(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
        <div>
          <h2 className="text-lg font-semibold">All Roles</h2>
          <p className="text-sm text-text-muted">Manage system access levels</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus size={16} />
          <span>Create Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-card rounded-xl border hover:shadow-md transition-shadow">
            <div className="p-5 border-b flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{role.name}</h3>
                  {role.isSystem && (
                    <span className="text-[10px] uppercase tracking-wider bg-accent/20 px-1.5 py-0.5 rounded text-text-muted font-bold">
                      System
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-muted line-clamp-2 min-h-[40px]">
                  {role.description || "No description provided."}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingRole(role)}
                  className="p-2 hover:bg-accent rounded-lg text-text-muted hover:text-foreground transition-colors"
                  title="Edit Role"
                >
                  <Edit size={16} />
                </button>
                {!role.isSystem && role._count.users === 0 && (
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg text-text-muted hover:text-destructive transition-colors"
                    title="Delete Role"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Users size={14} />
                <span>{role._count.users} Users assigned</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Shield size={14} />
                <span>{role.permissions.length} Permissions</span>
              </div>

              <div className="pt-2 flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map(p => (
                  <span key={p.id} className="text-xs bg-accent/10 px-2 py-1 rounded border border-border">
                    {p.action} {p.subject}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="text-xs bg-accent/10 px-2 py-1 rounded border border-border text-text-muted">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
