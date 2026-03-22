import { db } from '@/lib/db';
import { leaveTypes, blackoutDates, notificationRules } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';

export async function listLeaveTypes() { return db.select().from(leaveTypes).orderBy(leaveTypes.name); }
export async function createLeaveType(data: { name: string; maxDays?: number; requiresApproval?: boolean }) { const [t] = await db.insert(leaveTypes).values(data).returning(); return t; }
export async function updateLeaveType(id: string, data: Partial<{ name: string; maxDays: number; requiresApproval: boolean; isActive: boolean }>) { const [t] = await db.update(leaveTypes).set(data).where(eq(leaveTypes.id, id)).returning(); if (!t) throw new NotFoundError('Leave type not found'); return t; }
export async function deleteLeaveType(id: string) { const [t] = await db.delete(leaveTypes).where(eq(leaveTypes.id, id)).returning(); if (!t) throw new NotFoundError('Leave type not found'); return t; }

export async function listBlackoutDates() { return db.select().from(blackoutDates).orderBy(blackoutDates.startDate); }
export async function createBlackoutDate(data: { name: string; startDate: string; endDate: string; verticals?: string[]; reason?: string }) { const [b] = await db.insert(blackoutDates).values(data).returning(); return b; }
export async function updateBlackoutDate(id: string, data: Partial<{ name: string; startDate: string; endDate: string; verticals: string[]; reason: string }>) { const [b] = await db.update(blackoutDates).set(data).where(eq(blackoutDates.id, id)).returning(); if (!b) throw new NotFoundError('Blackout date not found'); return b; }
export async function deleteBlackoutDate(id: string) { const [b] = await db.delete(blackoutDates).where(eq(blackoutDates.id, id)).returning(); if (!b) throw new NotFoundError('Blackout date not found'); return b; }

export async function listNotificationRules() { return db.select().from(notificationRules).orderBy(notificationRules.eventType); }
export async function createNotificationRule(data: { eventType: string; channels: Record<string, boolean>; template: string; verticals?: string[] }) { const [r] = await db.insert(notificationRules).values(data).returning(); return r; }
export async function updateNotificationRule(id: string, data: Partial<{ eventType: string; channels: Record<string, boolean>; template: string; isActive: boolean }>) { const [r] = await db.update(notificationRules).set(data).where(eq(notificationRules.id, id)).returning(); if (!r) throw new NotFoundError('Notification rule not found'); return r; }
export async function deleteNotificationRule(id: string) { const [r] = await db.delete(notificationRules).where(eq(notificationRules.id, id)).returning(); if (!r) throw new NotFoundError('Notification rule not found'); return r; }
