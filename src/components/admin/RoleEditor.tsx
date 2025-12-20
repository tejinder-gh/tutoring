"use client";

import { createRole, updateRole } from "@/lib/actions/roles";
import { Permission } from "@prisma/client";
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
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Role Name</label>
          <input
            name="name"
            defaultValue={role?.name}
            required
            className="w-full p-2 border rounded bg-background"
            placeholder="e.g. Senior Teacher"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={role?.description || ''}
            className="w-full p-2 border rounded bg-background"
            placeholder="Role description..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2">Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(permissionsBySubject).map(([subject, perms]) => (
            <div key={subject} className="border p-4 rounded bg-accent/5">
              <h4 className="capitalize font-semibold mb-3">{subject}</h4>
              <div className="space-y-2">
                {perms.map(perm => (
                  <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPermissions([...selectedPermissions, perm.id]);
                        } else {
                          setSelectedPermissions(selectedPermissions.filter(id => id !== perm.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="capitalize">{perm.action}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-text-muted hover:bg-accent rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (role ? 'Update Role' : 'Create Role')}
        </button>
      </div>
    </form>
  );
}
