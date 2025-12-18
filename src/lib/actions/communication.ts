"use server";

import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createQuery(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  await prisma.query.create({
    data: {
      subject,
      message,
      studentId: session.user.id,
      status: "OPEN"
    }
  });

  revalidatePath("/student/queries");
}

export async function createAnnouncement(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    await prisma.announcement.create({
        data: {
            title,
            content,
            authorId: session.user.id
        }
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/teacher/announcements");
    revalidatePath("/student");
}
