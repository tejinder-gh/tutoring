"use client";

import { createRole, updateRole } from "@/lib/actions/roles";
import type { Permission } from "@prisma/client";
import { Check, Save, Shield, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define strict types for props
type RoleWithPermissions = {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
};

type Props = {
  role?: RoleWithPermissions;
  allPermissions: Permission[];
  onClose?: () => void;
};

export function RoleEditor({ role, allPermissions, onClose }: Props) {
  const router = useRouter();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions.map(p => p.id) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group permissions by subject for better UI
  const permissionsBySubject = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.subject]) acc[perm.subject] = [];
    acc[perm.subject].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Append selected permissions
      selectedPermissions.forEach(pid => formData.append("permissions", pid));

      const result = role
        ? await updateRole(role.id, formData)
        : await createRole(formData);

      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
        if (onClose) onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Role Name</label>
          <input
            name="name"
            defaultValue={role?.name}
            required
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted/50"
            placeholder="e.g. Senior Teacher"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Description</label>
          <input
            name="description"
            defaultValue={role?.description || ''}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted/50"
            placeholder="Brief description of responsibilities..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Shield size={18} className="text-primary" />
          <h3 className="font-semibold text-lg">Permissions & Capabilities</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(permissionsBySubject).map(([subject, perms]) => (
            <div key={subject} className="bg-accent/5 rounded-xl border border-border/50 overflow-hidden hover:border-primary/20 transition-colors">
              <div className="px-4 py-3 bg-accent/10 border-b border-border/50 flex items-center justify-between">
                <h4 className="capitalize font-bold text-sm text-foreground">{subject}</h4>
                <span className="text-[10px] font-bold bg-background text-text-muted px-2 py-0.5 rounded border border-border">
                  {perms.filter(p => selectedPermissions.includes(p.id)).length}/{perms.length}
                </span>
              </div>
              <div className="p-4 space-y-3">
                {perms.map(perm => {
                  const isSelected = selectedPermissions.includes(perm.id);
                  return (
                    <label key={perm.id} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-primary/5' : 'hover:bg-accent/50'}`}>
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-text-muted/40 bg-background'}`}>
                        {isSelected && <Check size={10} className="text-primary-foreground" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissions([...selectedPermissions, perm.id]);
                          } else {
                            setSelectedPermissions(selectedPermissions.filter(id => id !== perm.id));
                          }
                        }}
                        className="hidden" // Hiding default checkbox
                      />
                      <span className={`text-sm select-none ${isSelected ? 'text-primary font-medium' : 'text-text-muted'}`}>
                        <span className="capitalize">{perm.action}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-muted hover:text-foreground hover:bg-accent rounded-xl transition-colors"
        >
          <X size={18} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          {isSubmitting ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save size={18} />
              <span>{role ? 'Update Role' : 'Create Role'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
