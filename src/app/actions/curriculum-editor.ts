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

export async function updateModule(moduleId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Check permission logic here (omitted for brevity, similar to above)

    const title = formData.get("title") as string;

    await prisma.module.update({
        where: { id: moduleId },
        data: { title }
    });

    revalidatePath(`/teacher/courses`);
    return { success: true };
}

export async function createLesson(moduleId: string, title: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Get max order
    const lastLesson = await prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: 'desc' }
    });
    const order = (lastLesson?.order || 0) + 1;

    await prisma.lesson.create({
        data: {
            title,
            moduleId,
            order,
            content: "", // Empty default

        }
    });
    revalidatePath(`/teacher/courses`);
    return { success: true };
}

export async function createModule(curriculumId: string, title: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const lastModule = await prisma.module.findFirst({
        where: { curriculumId },
        orderBy: { order: 'desc' }
    });
    const order = (lastModule?.order || 0) + 1;

    await prisma.module.create({
        data: {
            title,
            curriculumId,
            order
        }
    });

    revalidatePath(`/teacher/courses`);
    return { success: true };
}

export async function publishCurriculum(curriculumId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.curriculum.update({
        where: { id: curriculumId },
        data: { status: "APPROVED" } // Auto approve for teacher's own live version for now? Or PENDING?
        // Let's say teachers can publish to live immediately in this flow as per the button "Publish Changes"
    });

    revalidatePath(`/teacher/courses`);
    return { success: true };
}
