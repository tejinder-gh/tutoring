"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
});

export async function createCourse(formData: FormData) {
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
  };

  const validation = CourseSchema.safeParse(rawData);

  if (!validation.success) {
    // In a real app, you'd return the errors to be displayed.
    // For direct form action usage without useFormState, throwing or redirecting is common.
    // Here we'll just return nothing to satisfy the type, but in production use useFormState.
    console.error("Validation failed");
    return;
  }

  await db.course.create({
    data: {
      title: validation.data.title,
      description: validation.data.description || "",
      slug: validation.data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now(),
      curriculums: {
          create: {}
      }
    },
  });

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function addModule(courseId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const richTextContent = formData.get("richTextContent") as string;

    const curriculum = await db.curriculum.findFirst({ where: { courseId, teacherId: null } });
    if (!curriculum) return; // Should handle error

    // Find current max order
    const lastModule = await db.module.findFirst({
        where: { curriculumId: curriculum.id },
        orderBy: { order: 'desc' }
    });

    const newOrder = lastModule ? lastModule.order + 1 : 1;

    await db.module.create({
        data: {
            title,
            richTextContent: richTextContent || null,
            curriculumId: curriculum.id,
            order: newOrder
        }
    });

    revalidatePath(`/admin/courses/${courseId}`);
}

export async function addLesson(moduleId: string, courseId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const weightageStr = formData.get("weightage") as string;
    const weightage = weightageStr ? parseFloat(weightageStr) : 1.0;

    await db.lesson.create({
        data: {
            title,
            content,
            weightage: isNaN(weightage) ? 1.0 : weightage,
            moduleId
        }
    });

    revalidatePath(`/admin/courses/${courseId}`);
}

export async function createAssignment(courseId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const moduleId = formData.get("moduleId") as string;
    const dueInDaysStr = formData.get("dueInDays") as string;

    // Parse dueInDays to integer, default to null if not provided
    const dueInDays = dueInDaysStr ? parseInt(dueInDaysStr) : null;

    const curriculum = await db.curriculum.findFirst({ where: { courseId, teacherId: null } });
    if (!curriculum) return;

    await db.assignment.create({
        data: {
            title,
            description: description || "",
            dueInDays: isNaN(dueInDays as number) ? null : dueInDays,
            moduleId: moduleId || null,
            curriculumId: curriculum.id
        }
    });

    revalidatePath(`/admin/courses/${courseId}`);
}

export async function addNoteToModule(moduleId: string, content: string) {
    if (!moduleId || !content) return;

    await db.module.update({
        where: { id: moduleId },
        data: { richTextContent: content }
    });

    // We don't know the courseId here easily to revalidate path efficiently without a lookup,
    // but in a server action called from client, we usually revalidate the current path.
    // For now we can fetch it to be safe if strictly needed, or rely on client to call revalidate.
    // Let's look it up.
    const module = await db.module.findUnique({
        where: { id: moduleId },
        select: { curriculum: { select: { courseId: true } } }
    });

    if (module?.curriculum?.courseId) {
        revalidatePath(`/admin/courses/${module.curriculum.courseId}`);
    }
}
