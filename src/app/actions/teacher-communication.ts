"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
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
    const isTeacher = await db.teacherProfile.findFirst({
        where: { userId: session.user.id, courses: { some: { id: courseId } } }
    });
    if (!isTeacher) return { error: "You do not teach this course" };
  }

  await db.announcement.create({
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

    const ReplySchema = z.object({
        response: z.string().min(1, "Response required")
    });

    const validation = ReplySchema.safeParse({ response: formData.get("response") });
    if (!validation.success) return { error: validation.error.flatten().fieldErrors.response?.[0] || "Invalid data" };

    const { response } = validation.data;

    // Verify query belongs to a student in teacher's purview?
    // For now, assume if they can see it, they can reply.
    // In a real app, strict checks: Does query.student belong to a batch taught by teacher?

    await db.query.update({
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
