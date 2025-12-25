"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Fetch lesson content from URL for student viewing
 */
export async function getLessonContent(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      contentUrl: true,
      contentType: true,
      content: true, // Deprecated field for fallback
    },
  });

  if (!lesson) return null;

  // If contentUrl exists, fetch from URL
  if (lesson.contentUrl) {
    try {
      const response = await fetch(lesson.contentUrl);
      if (!response.ok) throw new Error("Failed to fetch content");
      const content = await response.text();
      return { ...lesson, fetchedContent: content };
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      // Fall back to deprecated content field
      return { ...lesson, fetchedContent: lesson.content || "" };
    }
  }

  // Fall back to deprecated inline content
  return { ...lesson, fetchedContent: lesson.content || "" };
}

/**
 * Fetch lesson content for editing (admin/teacher only)
 */
export async function getLessonContentForEdit(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const role = (session.user as any).role?.name;
  if (!role || !['ADMIN', 'TEACHER', 'DIRECTOR'].includes(role)) {
    return { success: false, error: "Unauthorized" };
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      contentUrl: true,
      contentType: true,
      content: true,
      videoUrl: true,
      order: true,
      moduleId: true,
    },
  });

  if (!lesson) {
    return { success: false, error: "Lesson not found" };
  }

  let editableContent = "";

  // If contentUrl exists, fetch from URL
  if (lesson.contentUrl) {
    try {
      const response = await fetch(lesson.contentUrl);
      if (!response.ok) throw new Error("Failed to fetch content");
      editableContent = await response.text();
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      editableContent = lesson.content || "";
    }
  } else {
    editableContent = lesson.content || "";
  }

  return {
    success: true,
    lesson: {
      ...lesson,
      editableContent,
    },
  };
}

/**
 * Save lesson content to file and update lesson record
 * This creates a markdown/MDX file and uploads it to UploadThing
 */
export async function saveLessonContent(
  lessonId: string,
  content: string,
  contentUrl: string, // URL from UploadThing after uploading the file
  contentType: "markdown" | "mdx" | "html" | "text" = "markdown"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const role = (session.user as any).role?.name;
  if (!role || !['ADMIN', 'TEACHER', 'DIRECTOR'].includes(role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        contentUrl,
        contentType,
        // Keep deprecated content field in sync for now
        content,
      },
    });

    revalidatePath(`/admin/courses`);
    revalidatePath(`/student/learn`);
    return { success: true, lesson };
  } catch (error) {
    console.error("Failed to save lesson content:", error);
    return { success: false, error: "Failed to save lesson content" };
  }
}

/**
 * Migrate a single lesson from inline content to file-based storage
 */
export async function migrateLessonContent(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const role = (session.user as any).role?.name;
  if (!role || !['ADMIN', 'TEACHER', 'DIRECTOR'].includes(role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, content: true, contentUrl: true },
    });

    if (!lesson) {
      return { success: false, error: "Lesson not found" };
    }

    if (lesson.contentUrl) {
      return {
        success: false,
        error: "Lesson already migrated to file-based storage",
      };
    }

    if (!lesson.content) {
      return { success: false, error: "Lesson has no content to migrate" };
    }

    // Return content to be uploaded by client
    return {
      success: true,
      content: lesson.content,
      message: "Content ready for migration. Please upload to UploadThing.",
    };
  } catch (error) {
    console.error("Failed to migrate lesson:", error);
    return { success: false, error: "Failed to migrate lesson" };
  }
}

/**
 * Get all lessons that need migration
 */
export async function getLessonsNeedingMigration() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const role = (session.user as any).role?.name;
  if (!role || !['ADMIN', 'TEACHER', 'DIRECTOR'].includes(role)) {
    return { success: false, error: "Unauthorized" };
  }

  const lessons = await prisma.lesson.findMany({
    where: {
      content: { not: null },
      contentUrl: null,
    },
    select: {
      id: true,
      title: true,
      module: {
        select: {
          id: true,
          title: true,
          curriculum: {
            select: {
                course: {
                    select: {
                    id: true,
                    title: true,
                    },
                },
            }
          },
        },
      },
    },
    orderBy: [{ module: { curriculum: { courseId: "asc" } } }, { order: "asc" }],
  });

  return lessons;
}

/**
 * Update lesson metadata (title, videoUrl, order, etc.)
 */
export async function updateLessonMetadata(
  lessonId: string,
  data: {
    title?: string;
    videoUrl?: string;
    order?: number;
    isActive?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const role = (session.user as any).role?.name;
  if (!role || !['ADMIN', 'TEACHER', 'DIRECTOR'].includes(role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    revalidatePath(`/admin/courses`);
    revalidatePath(`/student/learn`);
    return { success: true, lesson };
  } catch (error) {
    console.error("Failed to update lesson:", error);
    return { success: false, error: "Failed to update lesson" };
  }
}
