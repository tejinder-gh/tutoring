"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateLessonContent(lessonId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership (Teacher must own the curriculum this lesson belongs to)
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { curriculum: true } } }
  });

  if (!lesson) throw new Error("Lesson not found");

  // Strict check: Only allow editing if the curriculum belongs to the current teacher
  const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: session.user.id } });
  if (!teacherProfile || lesson.module.curriculum.teacherId !== teacherProfile.id) {
    throw new Error("You can only edit your own curriculum version");
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { richTextContent: content }
  });

  revalidatePath(`/teacher/courses`);
  return { success: true };
}

export async function submitCurriculumAction(curriculumId: string) {
    const session = await auth();
    if(!session?.user?.id) throw new Error("Unauthorized");

    await prisma.curriculum.update({
        where: { id: curriculumId },
        data: { status: "PENDING_APPROVAL" }
    });

    revalidatePath(`/teacher/courses`);
    return { success: true };
}
