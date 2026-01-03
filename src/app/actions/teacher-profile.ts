"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProfileSchema = z.object({
  bio: z.string().optional(),
  qualification: z.string().optional(),
  domain: z.string().min(2, "Domain is required"),
});

export async function updateTeacherProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    bio: formData.get("bio") as string,
    qualification: formData.get("qualification") as string,
    domain: formData.get("domain") as string,
  };

  const validation = ProfileSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: validation.error.message };
  }

  const { bio, qualification, domain } = validation.data;

  try {
    await db.teacherProfile.update({
      where: { userId: session.user.id },
      data: {
        bio: bio ?? null,
        qualification: qualification ?? null,
        domain,
      },
    });

    revalidatePath("/teacher/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
