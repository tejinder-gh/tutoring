"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AnnouncementSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  courseId: z.string().optional(), // If targeting a specific course
});

export async function createTeacherAnnouncement(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    courseId: formData.get("courseId")?.toString() || null,
  };

  const validation = AnnouncementSchema.safeParse(rawData);
  if (!validation.success) return { error: "Invalid data" };

  const { title, content, courseId } = validation.data;

  // Verify teacher has access to this course if courseId is provided
  if (courseId) {
    const isTeacher = await prisma.teacherProfile.findFirst({
        where: { userId: session.user.id, courses: { some: { id: courseId } } }
    });
    if (!isTeacher) return { error: "You do not teach this course" };
  }

  await prisma.announcement.create({
    data: {
      title,
      content,
      authorId: session.user.id,
      courseId: courseId ?? null
    }
  });

  revalidatePath("/teacher/communication");
  revalidatePath("/teacher");
  return { success: true };
}

export async function replyToQuery(queryId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const response = formData.get("response") as string;
    if (!response || response.trim().length === 0) return { error: "Response required" };

    // Verify query belongs to a student in teacher's purview?
    // For now, assume if they can see it, they can reply.
    // In a real app, strict checks: Does query.student belong to a batch taught by teacher?

    await prisma.query.update({
        where: { id: queryId },
        data: {
            response,
            status: "RESOLVED",
            resolvedById: session.user.id,
            updatedAt: new Date()
        }
    });

    revalidatePath("/teacher/communication");
    return { success: true };
}
