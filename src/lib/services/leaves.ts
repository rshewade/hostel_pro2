import { db } from '@/lib/db';
import { leaveRequests } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type { CreateLeaveInput, UpdateLeaveStatusInput } from '@/lib/validations/leaves';

export async function createLeaveRequest(data: CreateLeaveInput, studentUserId: string) {
  const [leave] = await db.insert(leaveRequests).values({
    studentUserId,
    type: data.type,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    reason: data.reason,
    destination: data.destination,
    emergencyContact: data.emergencyContact,
    status: 'PENDING',
  }).returning();
  return leave;
}

export async function getLeaveById(id: string) {
  const [leave] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
  if (!leave) throw new NotFoundError('Leave request not found');
  return leave;
}

export async function updateLeaveStatus(id: string, data: UpdateLeaveStatusInput, actorId: string) {
  const updateData: Record<string, unknown> = { status: data.status };
  if (data.status === 'APPROVED') {
    updateData.approvedBy = actorId;
    updateData.approvedAt = new Date();
  }
  if (data.status === 'REJECTED') {
    updateData.rejectedBy = actorId;
    updateData.rejectedAt = new Date();
    updateData.rejectionReason = data.rejectionReason;
  }

  const [leave] = await db.update(leaveRequests).set(updateData).where(eq(leaveRequests.id, id)).returning();
  if (!leave) throw new NotFoundError('Leave request not found');
  return leave;
}

export async function recordCheckout(id: string) {
  const [leave] = await db.update(leaveRequests).set({ checkOutTime: new Date() }).where(eq(leaveRequests.id, id)).returning();
  if (!leave) throw new NotFoundError('Leave request not found');
  return leave;
}

export async function recordReturn(id: string) {
  const [leave] = await db.update(leaveRequests).set({
    checkInTime: new Date(),
    status: 'COMPLETED',
  }).where(eq(leaveRequests.id, id)).returning();
  if (!leave) throw new NotFoundError('Leave request not found');
  return leave;
}

export async function listLeaves(options: { studentUserId?: string; status?: string; page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = options;
  const conditions = [];
  if (options.studentUserId) conditions.push(eq(leaveRequests.studentUserId, options.studentUserId));
  if (options.status) conditions.push(eq(leaveRequests.status, options.status as any));

  const data = await db.select().from(leaveRequests)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(leaveRequests.createdAt))
    .limit(limit).offset((page - 1) * limit);

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(leaveRequests)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { data, total: Number(countResult.count) };
}

export async function getStudentLeaves(studentUserId: string) {
  return db.select().from(leaveRequests)
    .where(eq(leaveRequests.studentUserId, studentUserId))
    .orderBy(desc(leaveRequests.createdAt));
}
