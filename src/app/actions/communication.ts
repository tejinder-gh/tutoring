"use server";

import { auth } from "@/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Priority, QueryStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type QueryWithDetails = {
  id: string;
  subject: string;
  message: string;
  status: QueryStatus;
  priority: Priority;
  createdAt: Date;
  response: string | null;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  resolvedBy: {
    name: string;
  } | null;
};

export async function getAdminQueries(): Promise<QueryWithDetails[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("read", "user"); // or specific support permission

  const queries = await prisma.query.findMany({
    orderBy: [
      { status: "asc" }, // OPEN first
      { priority: "desc" }, // URGENT first
      { createdAt: "desc" }, // Newest first
    ],
    include: {
        student: {
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true
            }
        },
        resolvedBy: {
            select: {
                name: true
            }
        }
    }
  });

  return queries;
}

export async function updateQueryStatus(queryId: string, status: QueryStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("update", "user");

  await prisma.query.update({
    where: { id: queryId },
    data: {
      status,
      resolvedById: status === "RESOLVED" || status === "CLOSED" ? session.user.id : null,
      resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/support");
}

export async function replyToQuery(queryId: string, response: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await requirePermission("update", "user");

    const query = await prisma.query.update({
      where: { id: queryId },
      data: {
        response,
        status: "RESOLVED",
        resolvedById: session.user.id,
        resolvedAt: new Date(),
      },
      include: {
        student: true
      }
    });

    // Send email notification to student
    if (query.student.email) {
        try {
            const { sendEmail } = await import("@/lib/email");
            await sendEmail({
                to: query.student.email,
                subject: `Your Query Has Been Resolved: ${query.subject}`,
                html: `<p>Dear ${query.student.name},</p><p>Your support query regarding "<strong>${query.subject}</strong>" has been resolved.</p><p><strong>Response:</strong></p><p>${response}</p><p>If you have any further questions, feel free to reach out.</p><p>Regards,<br/>Support Team</p>`
            });
        } catch (emailError) {
            console.error("Failed to send query resolution email:", emailError);
        }
    }

    // Create in-app notification
    await prisma.notification.create({
        data: {
            userId: query.studentId,
            title: 'Query Resolved',
            message: `Your query "${query.subject}" has been resolved. Check your email for details.`,
            type: 'SUCCESS',
            link: '/student/queries'
        }
    });

    revalidatePath("/admin/support");
  }
