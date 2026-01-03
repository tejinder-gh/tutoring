"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const settings = await db.setting.findMany();
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

  await db.$transaction(
    keys
      .map((key) => {
        const value = formData.get(key);
        if (value !== null) {
          return db.setting.upsert({
            where: { key },
            update: { value: value.toString() },
            create: {
              key,
              value: value.toString(),
              category: "general",
            },
          });
        }
        return null;
      })
      .filter((p) => p !== null) as any[]
  );

  revalidatePath("/admin/settings/general");
}
