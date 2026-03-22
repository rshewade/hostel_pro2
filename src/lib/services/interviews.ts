import { db } from '@/lib/db';
import { interviews } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';

export async function scheduleInterview(data: {
  applicationId: string;
  scheduledDate: string;
  scheduledTime?: string;
  mode?: string;
  meetingLink?: string;
  location?: string;
  superintendentId?: string;
  trusteeId?: string;
}) {
  const [interview] = await db.insert(interviews).values({
    applicationId: data.applicationId,
    scheduledDate: data.scheduledDate,
    scheduledTime: data.scheduledTime,
    mode: data.mode as any,
    meetingLink: data.meetingLink,
    location: data.location,
    superintendentId: data.superintendentId,
    trusteeId: data.trusteeId,
    status: 'SCHEDULED',
  }).returning();
  return interview;
}

export async function getInterviewById(id: string) {
  const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
  if (!interview) throw new NotFoundError('Interview not found');
  return interview;
}

export async function completeInterview(id: string, data: { finalScore?: number; notes?: string; internalRemarks?: string }) {
  const [interview] = await db.update(interviews).set({
    status: 'COMPLETED',
    completedAt: new Date(),
    finalScore: data.finalScore,
    notes: data.notes,
    internalRemarks: data.internalRemarks,
  }).where(eq(interviews.id, id)).returning();
  if (!interview) throw new NotFoundError('Interview not found');
  return interview;
}

export async function cancelInterview(id: string, reason: string) {
  const [interview] = await db.update(interviews).set({
    status: 'CANCELLED',
    cancelledAt: new Date(),
    cancellationReason: reason,
  }).where(eq(interviews.id, id)).returning();
  if (!interview) throw new NotFoundError('Interview not found');
  return interview;
}

export async function listInterviews(options: { status?: string; page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = options;
  const conditions = [];
  if (options.status) conditions.push(eq(interviews.status, options.status as any));

  const data = await db.select().from(interviews)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(interviews.createdAt))
    .limit(limit).offset((page - 1) * limit);

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(interviews)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { data, total: Number(countResult.count) };
}
