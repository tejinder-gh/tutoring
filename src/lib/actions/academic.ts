"use server";

import { prisma } from "@/lib/prisma";
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

  await prisma.course.create({
    data: {
      title: validation.data.title,
      description: validation.data.description || "",
    },
  });

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function addModule(courseId: string, formData: FormData) {
    const title = formData.get("title") as string;

    // Find current max order
    const lastModule = await prisma.module.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' }
    });

    const newOrder = lastModule ? lastModule.order + 1 : 1;

    await prisma.module.create({
        data: {
            title,
            courseId,
            order: newOrder
        }
    });

    revalidatePath(`/admin/courses/${courseId}`);
}

export async function addLesson(moduleId: string, courseId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    await prisma.lesson.create({
        data: {
            title,
            content,
            moduleId
        }
    });

    revalidatePath(`/admin/courses/${courseId}`);
}

export async function createAssignment(courseId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dueDateStr = formData.get("dueDate") as string; // YYYY-MM-DD

    const dueDate = dueDateStr ? new Date(dueDateStr) : null;

    await prisma.assignment.create({
        data: {
            title,
            description: description || "",
            dueDate,
            courseId
        }
    });

    revalidatePath(`/admin/courses/${courseId}`);
}
