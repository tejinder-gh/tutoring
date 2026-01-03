"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createQuery(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  await db.query.create({
    data: {
      subject,
      message,
      studentId: session.user.id,
      status: "OPEN"
    }
  });

  revalidatePath("/student/queries");
}

export async function createAnnouncement(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    await db.announcement.create({
        data: {
            title,
            content,
            authorId: session.user.id
        }
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/teacher/announcements");
    revalidatePath("/student");
}

export async function getAdminQueries() {
    const session = await auth();
    // In real app, check for ADMIN or SUPPORT role
    if (!session?.user) throw new Error("Unauthorized");

    return await db.query.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            student: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });
}

export async function resolveQuery(queryId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await db.query.update({
        where: { id: queryId },
        data: {
            status: "RESOLVED",
            resolvedById: session.user.id,
            resolvedAt: new Date()
        }
    });

    revalidatePath("/admin/support");
    revalidatePath("/student/queries");
    return true;
}

export async function createQueryReply(queryId: string, response: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await db.query.update({
        where: { id: queryId },
        data: {
            response,
            status: "RESOLVED",
            resolvedById: session.user.id,
            resolvedAt: new Date()
        }
    });

    revalidatePath("/admin/support");
    revalidatePath("/student/queries");
    return true;
}
