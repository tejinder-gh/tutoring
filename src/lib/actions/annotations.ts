"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =============================================================================
// HIGHLIGHTS
// =============================================================================

/**
 * Create a new text highlight
 */
export async function createHighlight(
  lessonId: string,
  data: {
    selectedText: string;
    startOffset: number;
    endOffset: number;
    color?: string;
    note?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const highlight = await prisma.lessonHighlight.create({
      data: {
        lessonId,
        userId: session.user.id,
        selectedText: data.selectedText,
        startOffset: data.startOffset,
        endOffset: data.endOffset,
        color: data.color || "#FFD700",
        note: data.note,
      },
    });

    revalidatePath(`/student/learn`);
    return { success: true, highlight };
  } catch (error) {
    console.error("Failed to create highlight:", error);
    return { success: false, error: "Failed to create highlight" };
  }
}

/**
 * Update an existing highlight (note or color)
 */
export async function updateHighlight(
  id: string,
  data: {
    note?: string;
    color?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const highlight = await prisma.lessonHighlight.update({
      where: {
        id,
        userId: session.user.id, // Ensure ownership
      },
      data,
    });

    revalidatePath(`/student/learn`);
    return { success: true, highlight };
  } catch (error) {
    console.error("Failed to update highlight:", error);
    return { success: false, error: "Failed to update highlight" };
  }
}

/**
 * Delete a highlight
 */
export async function deleteHighlight(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.lessonHighlight.delete({
      where: {
        id,
        userId: session.user.id, // Ensure ownership
      },
    });

    revalidatePath(`/student/learn`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete highlight:", error);
    return { success: false, error: "Failed to delete highlight" };
  }
}

/**
 * Get user's highlights for a specific lesson
 */
export async function getHighlightsByLesson(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const highlights = await prisma.lessonHighlight.findMany({
    where: {
      lessonId,
      userId: session.user.id,
    },
    orderBy: { startOffset: "asc" },
  });

  return highlights;
}

/**
 * Get all highlights for the current user
 */
export async function getAllHighlights() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const highlights = await prisma.lessonHighlight.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          module: {
            select: {
              id: true,
              title: true,
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return highlights;
}

// =============================================================================
// BOOKMARKS
// =============================================================================

/**
 * Toggle bookmark for a lesson
 */
export async function toggleBookmark(
  lessonId: string,
  data?: {
    title?: string;
    note?: string;
    position?: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if exists
    const existing = await prisma.lessonBookmark.findUnique({
      where: {
        lessonId_userId: {
          lessonId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      // Access delete
      await prisma.lessonBookmark.delete({
        where: { id: existing.id },
      });
      revalidatePath(`/student/bookmarks`);
      revalidatePath(`/student/learn`);
      return { success: true, isBookmarked: false };
    } else {
      // Create
      const bookmark = await prisma.lessonBookmark.create({
        data: {
          lessonId,
          userId: session.user.id,
          title: data?.title,
          note: data?.note,
          position: data?.position || 0,
        },
      });
      revalidatePath(`/student/bookmarks`);
      revalidatePath(`/student/learn`);
      return { success: true, isBookmarked: true, bookmark };
    }
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    return { success: false, error: "Failed to toggle bookmark" };
  }
}

/**
 * Check if a lesson is bookmarked
 */
export async function getLessonBookmark(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const bookmark = await prisma.lessonBookmark.findUnique({
    where: {
      lessonId_userId: {
        lessonId,
        userId: session.user.id,
      },
    },
  });

  return bookmark;
}

/**
 * Get all user bookmarks
 */
export async function getUserBookmarks() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const bookmarks = await prisma.lessonBookmark.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          module: {
            select: {
              id: true,
              title: true,
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return bookmarks;
}
