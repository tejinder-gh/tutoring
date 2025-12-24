"use server";

import { auth } from "@/auth";
import { AuditAction, AuditResource, logActivity } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Fetch paginated leads
 */
export async function getLeads(page = 1, limit = 20) {
  const session = await auth();
  if (!session?.user?.id) return { leads: [], total: 0 };

  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
         // Optimize? Maybe just count activities
         _count: { select: { activities: true } }
      }
    }),
    prisma.lead.count(),
  ]);

  return { leads, total };
}

/**
 * Fetch single lead with full activity history
 */
export async function getLeadById(leadId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        // Use createdBy relationship if we had one in LeadActivity pointing to User
        // Checking schema: createdBy is String, not a relation? Let's check schema again if needed.
        // Schema Analysis earlier: `createdBy String`. It does NOT have a @relation.
        // We will just display the ID or fetch generic user?
        // Best effort: we'll store user NAME in 'createdBy' for display or just ID.
        // Actually, let's fix the schema later if needed. For now, it's just a string ID.
      },
      assignedToUser: { // Assuming generic 'assignedTo' might be relation? No, schema was `assignedTo String?`
         // Schema check: `assignedTo String?`. No relation defined in provided schema text.
         // We'll skip relation include.
      }
    },
  });
}

/**
 * Log an activity (Call, Note, etc.)
 */
export async function logLeadActivity(leadId: string, type: string, notes: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.leadActivity.create({
      data: {
        leadId,
        type,
        notes,
        createdBy: session.user.id, // Storing ID
      },
    });

    revalidatePath(`/admin/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to log activity:", error);
    return { success: false, error: "Failed to log activity" };
  }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const oldLead = await prisma.lead.findUnique({ where: { id: leadId } });

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    // Semantic logging
    await prisma.leadActivity.create({
      data: {
        leadId,
        type: "STATUS_CHANGE",
        notes: `Status changed from ${oldLead?.status} to ${status}`,
        createdBy: session.user.id,
      },
    });

    // Audit Log
    await logActivity({
      action: AuditAction.UPDATE,
      resource: AuditResource.LEAD,
      details: `Updated status to ${status}`,
      metadata: { leadId, oldStatus: oldLead?.status, newStatus: status },
      userId: session.user.id
    });

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath(`/admin/leads`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Failed to update status" };
  }
}
