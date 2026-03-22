import { db } from '@/lib/db';
import { leaveTypes, blackoutDates, notificationRules } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';

// --- Leave Types ---
export async function listLeaveTypes() {
  return db.select().from(leaveTypes).orderBy(leaveTypes.name);
}

export async function createLeaveType(data: { name: string; maxDays?: number; requiresApproval?: boolean }) {
  const [type] = await db.insert(leaveTypes).values(data).returning();
  return type;
}

export async function updateLeaveType(id: string, data: Partial<{ name: string; maxDays: number; requiresApproval: boolean; isActive: boolean }>) {
  const [type] = await db.update(leaveTypes).set(data).where(eq(leaveTypes.id, id)).returning();
  if (!type) throw new NotFoundError('Leave type not found');
  return type;
}

export async function deleteLeaveType(id: string) {
  const [type] = await db.delete(leaveTypes).where(eq(leaveTypes.id, id)).returning();
  if (!type) throw new NotFoundError('Leave type not found');
  return type;
}

// --- Blackout Dates ---
export async function listBlackoutDates() {
  return db.select().from(blackoutDates).orderBy(blackoutDates.startDate);
}

export async function createBlackoutDate(data: { name: string; startDate: string; endDate: string; verticals?: string[]; reason?: string }) {
  const [bd] = await db.insert(blackoutDates).values(data).returning();
  return bd;
}

export async function updateBlackoutDate(id: string, data: Partial<{ name: string; startDate: string; endDate: string; verticals: string[]; reason: string }>) {
  const [bd] = await db.update(blackoutDates).set(data).where(eq(blackoutDates.id, id)).returning();
  if (!bd) throw new NotFoundError('Blackout date not found');
  return bd;
}

export async function deleteBlackoutDate(id: string) {
  const [bd] = await db.delete(blackoutDates).where(eq(blackoutDates.id, id)).returning();
  if (!bd) throw new NotFoundError('Blackout date not found');
  return bd;
}

// --- Notification Rules ---
export async function listNotificationRules() {
  return db.select().from(notificationRules).orderBy(notificationRules.eventType);
}

export async function createNotificationRule(data: { eventType: string; timing?: string; channels: Record<string, boolean>; verticals?: string[]; template: string }) {
  const [rule] = await db.insert(notificationRules).values(data).returning();
  return rule;
}

export async function updateNotificationRule(id: string, data: Partial<{ eventType: string; timing: string; channels: Record<string, boolean>; verticals: string[]; template: string; isActive: boolean }>) {
  const [rule] = await db.update(notificationRules).set(data).where(eq(notificationRules.id, id)).returning();
  if (!rule) throw new NotFoundError('Notification rule not found');
  return rule;
}

export async function deleteNotificationRule(id: string) {
  const [rule] = await db.delete(notificationRules).where(eq(notificationRules.id, id)).returning();
  if (!rule) throw new NotFoundError('Notification rule not found');
  return rule;
}
