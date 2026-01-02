"use server";

import { auth } from "@/auth";
import { AuditAction, AuditResource, logActivity } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { LeadSource, LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Create a new lead
 */
export async function createLead(data: {
  name: string;
  email?: string;
  phone: string;
  source?: LeadSource;
  notes?: string;
  courseInterest?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source || "OTHER",
        notes: data.notes,
        courseInterest: data.courseInterest,
        status: "NEW", // Default
      },
    });

    // Log creation
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "CREATED",
        notes: "Lead created manually",
        createdBy: session.user.id,
      },
    });

    // Audit Log
    await logActivity({
      action: AuditAction.CREATE,
      resource: AuditResource.LEAD,
      details: `Created lead ${lead.name}`,
      metadata: { leadId: lead.id },
      userId: session.user.id
    });

    revalidatePath("/admin/leads");
    return { success: true, data: lead };
  } catch (error) {
    console.error("Failed to create lead:", error);
    return { success: false, error: "Failed to create lead" };
  }
}

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
      },
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
