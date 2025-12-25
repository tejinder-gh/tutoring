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
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border bg-accent/5">
          <h2 className="text-2xl font-bold tracking-tight">{isCreating ? "Create New Role" : `Edit ${editingRole?.name}`}</h2>
          <p className="text-text-muted">Define the permissions and access levels for this role.</p>
        </div>
        <div className="p-6">
          <RoleEditor
            role={editingRole || undefined}
            allPermissions={permissions}
            onClose={() => {
              setEditingRole(undefined);
              setIsCreating(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-gradient-to-br from-background to-accent/10 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">All Roles</h2>
          <p className="text-text-muted mt-1">Manage system access levels and permissions</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
            <Plus size={16} />
          </div>
          <span>Create Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="group relative bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-elegant transition-all duration-300 overflow-hidden flex flex-col">
            {/* Gradient Top Border */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${role.isSystem ? 'from-purple-500 via-indigo-500 to-blue-500' : 'from-primary/60 via-primary to-primary/40'}`} />

            <div className="p-6 border-b border-border flex-1">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-foreground">{role.name}</h3>
                  {role.isSystem && (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-200 dark:border-purple-800">
                      <Shield size={10} /> System
                    </span>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingRole(role)}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-muted hover:text-foreground transition-colors"
                    title="Edit Role"
                  >
                    <Edit size={16} />
                  </button>
                  {!role.isSystem && role._count.users === 0 && (
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-text-muted hover:text-red-600 transition-colors"
                      title="Delete Role"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-text-muted leading-relaxed line-clamp-2 min-h-[40px]">
                {role.description || "No description provided for this role."}
              </p>
            </div>

            <div className="p-6 bg-accent/5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <Users size={16} />
                  <span>Assignments</span>
                </div>
                <span className="font-semibold text-foreground bg-background px-2 py-0.5 rounded border border-border">{role._count.users}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
                  <Shield size={16} />
                  <span>Capabilities</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.length > 0 ? (
                    <>
                      {role.permissions.slice(0, 3).map(p => (
                        <span key={p.id} className="text-[10px] font-medium bg-background px-2 py-1 rounded-md border border-border shadow-xs text-foreground/80">
                          {p.action} {p.subject}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="text-[10px] font-medium bg-secondary/10 px-2 py-1 rounded-md border border-secondary/20 text-secondary">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-text-muted italic">No specific permissions</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Role Card - Always visible logic for easy access */}
        <button
          onClick={() => setIsCreating(true)}
          className="group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/5 transition-all duration-300 min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
            <Plus size={32} className="text-text-muted group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-text-muted group-hover:text-primary transition-colors">Add New Role</h3>
            <p className="text-sm text-text-muted/70 mt-1">Configure a new access level</p>
          </div>
        </button>
      </div>
    </div>
  );
}
