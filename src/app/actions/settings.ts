"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  // Transform array to object
  return settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
}

export async function updateSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // In a real app, map inputs dynamically or strictly.
  // For now, let's assume we handle specific keys:
  const keys = [
      "site.name",
      "site.description",
      "contact.email",
      "contact.phone",
      "contact.address"
  ];

  for (const key of keys) {
      const value = formData.get(key);
      if (value !== null) {
          await prisma.setting.upsert({
              where: { key },
              update: { value: value.toString() },
              create: {
                  key,
                  value: value.toString(),
                  category: "general"
              }
          });
      }
  }

  revalidatePath("/admin/settings/general");
}
