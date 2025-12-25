"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get all courses the current user is enrolled in, with progress
 */
export async function getEnrolledCourses() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentProfile: { userId: session.user.id },
      status: "ACTIVE",
    },
    include: {
      course: {
        include: {
          curriculum: {
            include: {
              modules: {
                include: {
                  lessons: {
                    select: {
                      id: true,
                      lessonProgress: {
                        where: { userId: session.user.id },
                        select: { completed: true },
                      },
                    },
                  },
                },
                orderBy: { order: "asc" },
              },
            }
          }
        },
      },
    },
  });

  // Calculate progress for each course
  return enrollments.map((enrollment) => {
    const course = enrollment.course;
    const modules = course.curriculum?.modules || [];
    const allLessons = modules.flatMap((m) => m.lessons);
    const completedLessons = allLessons.filter(
      (l) => l.lessonProgress?.[0]?.completed
    ).length;

    const progressPercent =
      allLessons.length > 0
        ? Math.round((completedLessons / allLessons.length) * 100)
        : 0;

    return {
      id: enrollment.id,
      courseId: course.id,
      courseSlug: course.slug,
      courseTitle: course.title,
      courseThumbnail: course.thumbnailUrl,
      totalLessons: allLessons.length,
      completedLessons,
      progressPercent,
      enrolledAt: enrollment.enrolledAt,
    };
  });
}

/**
 * Get course details with progress for the lesson viewer
 */
export async function getCourseWithProgress(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      curriculum: {
        include: {
            modules: {
                include: {
                lessons: {
                    include: {
                    resources: true,
                    lessonProgress: {
                        where: { userId: session.user.id },
                    },
                    },
                    orderBy: { order: "asc" },
                },
                },
                orderBy: { order: "asc" },
            },
        }
      }
    },
  });

  if (!course) return null;

  // Transform to include progress state
  const modules = course.curriculum?.modules || [];
  const modulesWithProgress = modules.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      order: lesson.order,
      resources: lesson.resources,
      completed: lesson.lessonProgress?.[0]?.completed ?? false,
      watchTime: lesson.lessonProgress?.[0]?.watchTime ?? 0,
    })),
  }));

  // Calculate overall progress
  const allLessons = modulesWithProgress.flatMap((m) => m.lessons);
  const completedLessons = allLessons.filter((l) => l.completed).length;
  const progressPercent =
    allLessons.length > 0
      ? Math.round((completedLessons / allLessons.length) * 100)
      : 0;

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    modules: modulesWithProgress,
    totalLessons: allLessons.length,
    completedLessons,
    progressPercent,
  };
}

/**
 * Get a single lesson with full content
 */
export async function getLesson(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      resources: true,
      module: {
        include: {
          curriculum: {
             include: {
                 course: { select: { id: true, title: true, slug: true } },
             }
          },
          lessons: {
            select: { id: true, title: true, order: true },
            orderBy: { order: "asc" },
          },
        },
      },
      lessonProgress: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!lesson) return null;

  // Find previous and next lessons
  const allLessons = lesson.module.lessons;
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return {
    id: lesson.id,
    title: lesson.title,
    content: lesson.content,
    videoUrl: lesson.videoUrl,
    resources: lesson.resources,
    course: lesson.module.curriculum.course,
    moduleTitle: lesson.module.title,
    completed: lesson.lessonProgress?.[0]?.completed ?? false,
    watchTime: lesson.lessonProgress?.[0]?.watchTime ?? 0,
    prevLesson,
    nextLesson,
  };
}

/**
 * Mark a lesson as complete
 */
export async function markLessonComplete(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.lessonProgress.upsert({
      where: {
        lessonId_userId: {
          lessonId,
          userId: session.user.id,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        lessonId,
        userId: session.user.id,
        completed: true,
        completedAt: new Date(),
      },
    });

    revalidatePath("/student/learn");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark lesson complete:", error);
    return { success: false, error: "Failed to update progress" };
  }
}

/**
 * Mark a lesson as incomplete (toggle)
 */
export async function markLessonIncomplete(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.lessonProgress.upsert({
      where: {
        lessonId_userId: {
          lessonId,
          userId: session.user.id,
        },
      },
      update: {
        completed: false,
        completedAt: null,
      },
      create: {
        lessonId,
        userId: session.user.id,
        completed: false,
      },
    });

    revalidatePath("/student/learn");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark lesson incomplete:", error);
    return { success: false, error: "Failed to update progress" };
  }
}

/**
 * Update watch time for video lessons
 */
export async function updateWatchTime(lessonId: string, seconds: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.lessonProgress.upsert({
      where: {
        lessonId_userId: {
          lessonId,
          userId: session.user.id,
        },
      },
      update: {
        watchTime: seconds,
      },
      create: {
        lessonId,
        userId: session.user.id,
        watchTime: seconds,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update watch time:", error);
    return { success: false, error: "Failed to update watch time" };
  }
}
