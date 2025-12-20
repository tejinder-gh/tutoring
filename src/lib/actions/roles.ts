"use server";

import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(z.string()), // Array of Permission IDs
});

export async function createRole(formData: FormData) {
  await requirePermission("manage", "settings");

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    permissions: formData.getAll("permissions") as string[],
  };

  const validation = RoleSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: "Invalid data" };
  }

  const { name, description, permissions } = validation.data;

  try {
    await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          connect: permissions.map((id) => ({ id })),
        },
      },
    });
    revalidatePath("/admin/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to create role:", error);
    return { error: "Failed to create role" };
  }
}

export async function updateRole(id: string, formData: FormData) {
  await requirePermission("manage", "settings");

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    permissions: formData.getAll("permissions") as string[],
  };

  const validation = RoleSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: "Invalid data" };
  }

  const { name, description, permissions } = validation.data;

  try {
    // First disconnect all, then connect new ones (simple replacement strategy)
    // Or simpler: just use `set` if supported, but `set` replaces relations.
    await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions: {
          set: permissions.map((pid) => ({ id: pid })),
        },
      },
    });
    revalidatePath("/admin/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to update role:", error);
    return { error: "Failed to update role" };
  }
}

export async function deleteRole(id: string) {
  await requirePermission("manage", "settings");

  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) return { error: "Role not found" };
    if (role.isSystem) return { error: "Cannot delete system role" };
    if (role._count.users > 0) return { error: "Cannot delete role with assigned users" };

    await prisma.role.delete({ where: { id } });
    revalidatePath("/admin/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete role:", error);
    return { error: "Failed to delete role" };
  }
}
