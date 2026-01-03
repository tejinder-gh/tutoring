"use server";

import { requirePermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(z.string()), // Array of Permission IDs
});

export type RoleActionResponse =
  | { success: true; error?: never }
  | { success: false; error: string; errors?: Record<string, string[]> };

export async function createRole(formData: FormData): Promise<RoleActionResponse> {
  await requirePermission("manage", "settings");

  try {
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      permissions: formData.getAll("permissions") as string[],
    };

    const data = roleSchema.parse(rawData);

    await db.role.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        permissions: {
          connect: data.permissions.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/admin/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to create role:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }
    return { success: false, error: "Failed to create role" };
  }
}

export async function updateRole(
  id: string,
  formData: FormData,
): Promise<RoleActionResponse> {
  await requirePermission("manage", "settings");

  try {
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      permissions: formData.getAll("permissions") as string[],
    };

    const data = roleSchema.parse(rawData);

    // First disconnect all, then connect new ones (simple replacement strategy)
    // Or simpler: just use `set` if supported, but `set` replaces relations.
    await db.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description ?? null,
        permissions: {
          set: data.permissions.map((pid) => ({ id: pid })),
        },
      },
    });

    revalidatePath("/admin/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to update role:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }
    return { success: false, error: "Failed to update role" };
  }
}

export async function deleteRole(id: string): Promise<RoleActionResponse> {
  await requirePermission("manage", "settings");

  try {
    const role = await db.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) return { success: false, error: "Role not found" };
    if (role.isSystem) return { success: false, error: "Cannot delete system role" };
    if (role._count.users > 0)
      return { success: false, error: "Cannot delete role with assigned users" };

    await db.role.delete({ where: { id } });
    revalidatePath("/admin/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete role:", error);
    return { success: false, error: "Failed to delete role" };
  }
}
