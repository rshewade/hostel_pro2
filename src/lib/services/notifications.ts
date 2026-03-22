import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  const [notification] = await db.insert(notifications).values({
    userId: data.userId,
    type: data.type as any,
    title: data.title,
    message: data.message,
    relatedEntityType: data.relatedEntityType,
    relatedEntityId: data.relatedEntityId,
    actionUrl: data.actionUrl,
    metadata: data.metadata,
  }).returning();
  return notification;
}

export async function listNotifications(userId: string, options: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 20 } = options;

  const data = await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit).offset((page - 1) * limit);

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(notifications)
    .where(eq(notifications.userId, userId));

  return { data, total: Number(countResult.count) };
}

export async function markAsRead(id: string) {
  const [notification] = await db.update(notifications).set({
    read: true,
    readAt: new Date(),
  }).where(eq(notifications.id, id)).returning();
  if (!notification) throw new NotFoundError('Notification not found');
  return notification;
}

export async function markAllAsRead(userId: string) {
  await db.update(notifications).set({
    read: true,
    readAt: new Date(),
  }).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  return Number(result.count);
}
