import { db } from '@/lib/db';
import { deviceSessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createHmac } from 'crypto';

export async function getDeviceSessions(userId: string) {
  return db.select().from(deviceSessions).where(eq(deviceSessions.userId, userId));
}

export async function upsertDeviceSession(data: {
  userId: string;
  deviceId: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const [existing] = await db.select().from(deviceSessions)
    .where(and(eq(deviceSessions.userId, data.userId), eq(deviceSessions.deviceId, data.deviceId)));

  if (existing) {
    const [updated] = await db.update(deviceSessions).set({
      lastUsedAt: new Date(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    }).where(eq(deviceSessions.id, existing.id)).returning();
    return updated;
  }

  const [created] = await db.insert(deviceSessions).values({
    userId: data.userId,
    deviceId: data.deviceId,
    deviceName: data.deviceName,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    isActive: true,
    lastUsedAt: new Date(),
  }).returning();
  return created;
}

export async function deactivateDeviceSession(userId: string, deviceId: string) {
  await db.update(deviceSessions).set({ isActive: false })
    .where(and(eq(deviceSessions.userId, userId), eq(deviceSessions.deviceId, deviceId)));
}

export function generateDeviceId(userAgent: string): string {
  return createHmac('sha256', 'device-id-salt').update(userAgent).digest('hex').slice(0, 16);
}
