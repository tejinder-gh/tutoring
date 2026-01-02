
"use server";

import { auth } from "@/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { EventType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createEvent(data: {
  title: string;
  startTime: string;
  endTime: string;
  type: EventType;
  batchId?: string;
  description?: string;
  assignmentId?: string;
  quizId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Teachers and Admins can create events
  await requirePermission("manage", "batch");

  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        type: data.type,
        batchId: data.batchId,
        description: data.description,
        assignmentId: data.assignmentId,
        quizId: data.quizId,
      },
    });

    revalidatePath("/teacher/schedule");
    revalidatePath("/student/schedule");
    return { success: true, data: event };
  } catch (error) {
    console.error("Failed to create event:", error);
    throw new Error("Failed to create event");
  }
}

export async function getBatchesForTeacher() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            courses: {
                include: {
                    batches: {
                        where: { isActive: true }
                    }
                }
            }
        }
    });

    if (!teacherProfile) return [];

    return teacherProfile.courses.flatMap((c: any) => c.batches.map((b: any) => ({
        id: b.id,
        name: b.name,
        courseName: c.title
    })));
}
