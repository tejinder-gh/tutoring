import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  PAYMENT = "PAYMENT",
  Enrollment = "ENROLLMENT"
}

export enum AuditResource {
  COURSE = "COURSE",
  USER = "USER",
  PAYMENT = "PAYMENT",
  SYSTEM = "SYSTEM",
  LEAD = "LEAD"
}

interface LogActivityParams {
  action: AuditAction | string;
  resource: AuditResource | string;
  details?: string;
  metadata?: Record<string, any>;
  userId?: string; // Optional: Override if action performed on behalf of someone else
}

/**
 * Log a critical system activity.
 * Silently fails in production to avoid blocking the main thread, but logs to console.
 */
export async function logActivity({
  action,
  resource,
  details,
  metadata,
  userId
}: LogActivityParams) {
  try {
    const session = await auth();
    const actorId = userId || session?.user?.id;

    if (!actorId) {
      console.warn("[Audit] No actor ID found for activity:", { action, resource });
      // We might still want to log system events initiated by background jobs/webhooks where there is no session
      // In that case, ensure your Prisma schema allows nullable userId or use a system user ID.
      // Looking at schema: User relations are typically strict.
      // Let's assume we skip logging anonymous actions for now or the schema `auditLogs` relation requires a User.
      // Schema check: model AuditLog { ... userId String ... user User ... } -> It IS required.
      return;
    }

    await prisma.auditLog.create({
      data: {
        userId: actorId,
        action: action.toString(),
        entity: resource.toString(), // Mapped 'resource' to 'entity'
        entityId: metadata?.id || metadata?.courseId ||  "N/A", // Try to extract ID from metadata
        oldValue: {}, // Default empty
        newValue: { details, ...metadata }, // Store details/metadata in newValue JSON
        ipAddress: "0.0.0.0",
      },
    });
  } catch (error) {
    console.error("[Audit] Failed to log activity:", error);
    // Do not throw; audit failure should not break the business transaction
  }
}
