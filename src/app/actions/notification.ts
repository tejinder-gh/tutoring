"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getNotifications(page = 1, limit = 10) {
  const session = await auth();
  if (!session?.user?.id) {
    return { notifications: [], hasNext: false, unreadCount: 0 };
  }

  const userId = session.user.id;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.notification.count({ where: { userId } }),
    db.notification.count({ where: { userId, isRead: false } })
  ]);

  return {
    notifications,
    hasNext: skip + limit < total,
    unreadCount
  };
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { isRead: true },
  });

  revalidatePath("/");
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/");
}
