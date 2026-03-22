import { db } from '@/lib/db';
import { consentLogs } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function recordConsent(data: {
  userId: string;
  consentType: string;
  consentTextHash?: string;
  deviceInfo?: string;
}) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6); // 6-month renewal

  const [consent] = await db.insert(consentLogs).values({
    userId: data.userId,
    consentType: data.consentType,
    consentTextHash: data.consentTextHash,
    deviceInfo: data.deviceInfo,
    grantedAt: new Date(),
    acceptedAt: new Date(),
    expiresAt,
  }).returning();
  return consent;
}

export async function revokeConsent(consentId: string, reason?: string) {
  const [consent] = await db.update(consentLogs).set({
    revokedAt: new Date(),
    revokedReason: reason,
  }).where(eq(consentLogs.id, consentId)).returning();
  return consent;
}

export async function getUserConsents(userId: string) {
  return db.select().from(consentLogs)
    .where(eq(consentLogs.userId, userId))
    .orderBy(desc(consentLogs.grantedAt));
}

export async function checkConsentRenewal(userId: string, consentType: string) {
  const [latest] = await db.select().from(consentLogs)
    .where(and(eq(consentLogs.userId, userId), eq(consentLogs.consentType, consentType)))
    .orderBy(desc(consentLogs.grantedAt))
    .limit(1);

  if (!latest) return { needsRenewal: true, reason: 'No consent on record' };
  if (latest.revokedAt) return { needsRenewal: true, reason: 'Consent was revoked' };
  if (latest.expiresAt && new Date() > latest.expiresAt) return { needsRenewal: true, reason: 'Consent expired' };

  return { needsRenewal: false, lastConsent: latest };
}
