"use server";

import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { LeaveStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type CreateLeaveInput = {
    startDate: Date;
    endDate: Date;
    reason: string;
};

export async function createLeaveRequest(data: CreateLeaveInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        await prisma.leave.create({
            data: {
                userId: session.user.id,
                startDate: data.startDate,
                endDate: data.endDate,
                reason: data.reason,
                status: "PENDING",
            },
        });

        // Determine revalidation path based on role
        // Ideally we check the role, but revalidating both is safe or we can just return success
        // and let client handle it. But standard practice here is revalidatePath.
        revalidatePath("/teacher/leaves");
        revalidatePath("/staff/leaves");
        revalidatePath("/admin/leaves"); // So admin sees it immediately

        return { success: true };
    } catch (error) {
        console.error("Failed to create leave request:", error);
        return { success: false, error: "Failed to submit leave request" };
    }
}

export async function getMyLeaves() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const leaves = await prisma.leave.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return leaves;
}

// For Admin
export async function getAllLeaveRequests(status?: LeaveStatus) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await requirePermission("read", "user"); // Assuming HR/Admin permission

    const leaves = await prisma.leave.findMany({
        where: status ? { status } : undefined,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    return leaves;
}

export async function updateLeaveStatus(leaveId: string, status: "APPROVED" | "REJECTED") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await requirePermission("update", "user"); // Assuming HR/Admin permission

    try {
        const leave = await prisma.leave.update({
            where: { id: leaveId },
            data: {
                status,
                approvedById: session.user.id,
            },
            include: { user: true }
        });

        // Notify the user via Email
        if (leave.user.email) {
            try {
                await sendEmail({
                    to: leave.user.email,
                    subject: `Leave Request ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
                    html: `<p>Dear ${leave.user.name},</p><p>Your leave request from <strong>${leave.startDate.toLocaleDateString()}</strong> to <strong>${leave.endDate.toLocaleDateString()}</strong> has been <strong>${status}</strong>.</p><p>Regards,<br/>Admin Team</p>`
                });
            } catch (emailError) {
                console.error("Failed to send leave status email:", emailError);
                // Don't fail the whole action just because email failed
            }
        }

        // Notify the user via In-App Notification
        await prisma.notification.create({
            data: {
                userId: leave.userId,
                title: `Leave Request ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
                message: `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been ${status.toLowerCase()}.`,
                type: status === 'APPROVED' ? 'SUCCESS' : 'ERROR',
                link: '/teacher/leaves' // or /staff/leaves, user will navigate correctly
            }
        });

        revalidatePath("/admin/leaves");
        return { success: true };
    } catch (error) {
        console.error("Failed to update leave status:", error);
        return { success: false, error: "Failed to update status" };
    }
}
