"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResourceType } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Create a new resource
 */
export async function createResource(data: {
  title: string;
  description?: string;
  url: string;
  type: ResourceType;
  fileSize?: number;
  mimeType?: string;
  isPublic?: boolean;
  courseId?: string;
  lessonId?: string;
  quizId?: string;
  assignmentId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // TODO: Add permission check for admin/teacher roles

  try {
    const resource = await prisma.resource.create({
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        type: data.type,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        isPublic: data.isPublic ?? false,
        uploadedById: session.user.id,
        curriculumId: data.courseId ? (await prisma.curriculum.findUnique({ where: { courseId: data.courseId } }))?.id : undefined,
        lessonId: data.lessonId,
        quizId: data.quizId,
        assignmentId: data.assignmentId,
      },
    });

    revalidatePath("/admin/resources");
    return { success: true, resource };
  } catch (error) {
    console.error("Failed to create resource:", error);
    return { success: false, error: "Failed to create resource" };
  }
}

/**
 * Update a resource
 */
export async function updateResource(
  id: string,
  data: {
    title?: string;
    description?: string;
    url?: string;
    type?: ResourceType;
    isPublic?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // TODO: Add permission check for admin/teacher roles

  try {
    const resource = await prisma.resource.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/resources");
    return { success: true, resource };
  } catch (error) {
    console.error("Failed to update resource:", error);
    return { success: false, error: "Failed to update resource" };
  }
}

/**
 * Delete a resource
 */
export async function deleteResource(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // TODO: Add permission check for admin/teacher roles

  try {
    await prisma.resource.delete({
      where: { id },
    });

    revalidatePath("/admin/resources");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return { success: false, error: "Failed to delete resource" };
  }
}

/**
 * Toggle resource visibility
 */
export async function toggleResourceVisibility(id: string, isPublic: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // TODO: Add permission check for admin/teacher roles

  try {
    const resource = await prisma.resource.update({
      where: { id },
      data: { isPublic },
    });

    revalidatePath("/admin/resources");
    return { success: true, resource };
  } catch (error) {
    console.error("Failed to toggle visibility:", error);
    return { success: false, error: "Failed to toggle visibility" };
  }
}

/**
 * Get all resources (admin view)
 */
export async function getAllResources(filters?: {
  type?: ResourceType;
  isPublic?: boolean;
  entityType?: "course" | "lesson" | "quiz" | "assignment";
  entityId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return [];

  // TODO: Add permission check for admin/teacher roles

  const where: any = {};

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.isPublic !== undefined) {
    where.isPublic = filters.isPublic;
  }

  if (filters?.entityType && filters?.entityId) {
    if (filters.entityType === 'course') {
        where.curriculum = { courseId: filters.entityId };
    } else {
        where[`${filters.entityType}Id`] = filters.entityId;
    }
  }

  const resources = await prisma.resource.findMany({
    where,
    include: {
      uploadedBy: {
        select: { id: true, name: true, email: true },
      },
      curriculum: {
        select: { course: { select: { id: true, title: true } } },
      },
      lesson: {
        select: { id: true, title: true },
      },
      quiz: {
        select: { id: true, title: true },
      },
      assignment: {
        select: { id: true, title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return resources.map(r => ({
      ...r,
      course: r.curriculum?.course || null
  }));
}

/**
 * Get resources by entity (course/lesson/quiz/assignment)
 */
export async function getResourcesByEntity(
  entityType: "course" | "lesson" | "quiz" | "assignment",
  entityId: string
) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const where: any = {};
  if (entityType === 'course') {
      where.curriculum = { courseId: entityId };
  } else {
      where[`${entityType}Id`] = entityId;
  }

  // Students can only see public resources
  const userRole = (session.user as any).role?.name;
  if (userRole === "STUDENT") {
    where.isPublic = true;
  }

  const resources = await prisma.resource.findMany({
    where,
    include: {
      uploadedBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return resources;
}

/**
 * Link an existing resource to an entity
 */
export async function linkResourceToEntity(
  resourceId: string,
  entityType: "course" | "lesson" | "quiz" | "assignment",
  entityId: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // TODO: Add permission check for admin/teacher roles

  try {
    const updateData: any = {};
    if (entityType === 'course') {
        const c = await prisma.curriculum.findUnique({ where: { courseId: entityId } });
        if (c) updateData.curriculumId = c.id;
    } else {
        updateData[`${entityType}Id`] = entityId;
    }

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: updateData,
    });

    revalidatePath("/admin/resources");
    return { success: true, resource };
  } catch (error) {
    console.error("Failed to link resource:", error);
    return { success: false, error: "Failed to link resource" };
  }
}

/**
 * Unlink resource from an entity
 */
export async function unlinkResourceFromEntity(
  resourceId: string,
  entityType: "course" | "lesson" | "quiz" | "assignment"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // TODO: Add permission check for admin/teacher roles

  try {
    const updateData: any = {};
    if (entityType === 'course') {
         updateData.curriculumId = null;
    } else {
         updateData[`${entityType}Id`] = null;
    }

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: updateData,
    });

    revalidatePath("/admin/resources");
    return { success: true, resource };
  } catch (error) {
    console.error("Failed to unlink resource:", error);
    return { success: false, error: "Failed to unlink resource" };
  }
}
