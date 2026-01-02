"use server";

import { auth } from "@/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function getAuditLogs(page: number = 1, limit: number = 50) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await requirePermission("read", "system");

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    }),
    prisma.auditLog.count()
  ]);

  return { logs, total, totalPages: Math.ceil(total / limit) };
}
