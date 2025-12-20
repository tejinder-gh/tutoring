"use server";

import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function requestLeave(data: { startDate: string; endDate: string; reason: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const leave = await prisma.leave.create({
      data: {
        userId: session.user.id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
      },
    });

    revalidatePath("/student/schedule");
    revalidatePath("/teacher/schedule");
    return { success: true, data: leave };
  } catch (error) {
    console.error("Failed to request leave:", error);
    throw new Error("Failed to submit leave request");
  }
}

export async function getMyLeaves() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const leaves = await prisma.leave.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      startDate: 'desc',
    },
  });

  return leaves;
}

export async function getPendingLeaves() {
     const session = await auth();
     // In a real app, check for ADMIN or HR role here
     if (!session?.user?.id) { // && role !== ADMIN
         throw new Error("Unauthorized");
     }

     const leaves = await prisma.leave.findMany({
         where: { status: 'PENDING' },
         include: {
             user: {
                 select: { name: true, email: true, role: true }
             }
         },
         orderBy: { createdAt: 'desc' }
     });

     return leaves;
}

export async function updateLeaveStatus(leaveId: string, status: 'APPROVED' | 'REJECTED') {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const leave = await prisma.leave.update({
            where: { id: leaveId },
            data: {
                status,
                approvedById: session.user.id
            },
            include: { user: true }
        });

        if (leave.user.email) {
            await sendEmail({
                to: leave.user.email,
                subject: `Leave Request ${status}`,
                html: `<p>Your leave request for ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been <strong>${status}</strong>.</p>`
            });
        }
        revalidatePath("/admin/leaves"); // Assuming admin page
        return { success: true };
    } catch (error) {
        console.error("Failed to update leave:", error);
        throw new Error("Failed to update leave status");
    }
}
