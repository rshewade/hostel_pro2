import { db } from '@/lib/db';
import { fees, payments } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type { CreateFeeInput, RecordPaymentInput } from '@/lib/validations/payments';

export async function createFee(data: CreateFeeInput) {
  const [fee] = await db.insert(fees).values({
    studentUserId: data.studentUserId, applicationId: data.applicationId, head: data.head,
    name: data.name, description: data.description, amount: String(data.amount), dueDate: data.dueDate, status: 'PENDING',
  }).returning();
  return fee;
}

export async function getFeeById(id: string) {
  const [fee] = await db.select().from(fees).where(eq(fees.id, id));
  if (!fee) throw new NotFoundError('Fee not found');
  return fee;
}

export async function recordPayment(data: RecordPaymentInput) {
  const [payment] = await db.insert(payments).values({
    feeId: data.feeId, studentUserId: data.studentUserId, amount: String(data.amount),
    paymentMethod: data.paymentMethod, transactionId: data.transactionId, status: 'PAID', paidAt: new Date(), notes: data.notes,
  }).returning();
  return payment;
}

export async function listFees(options: { studentUserId?: string; status?: string; page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = options;
  const conditions = [];
  if (options.studentUserId) conditions.push(eq(fees.studentUserId, options.studentUserId));
  if (options.status) conditions.push(eq(fees.status, options.status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const data = await db.select().from(fees).where(where).orderBy(desc(fees.createdAt)).limit(limit).offset((page - 1) * limit);
  const [c] = await db.select({ count: sql<number>`count(*)` }).from(fees).where(where);
  return { data, total: Number(c.count) };
}

export async function getPaymentSummary(studentUserId: string) {
  const [s] = await db.select({
    totalDue: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} IN ('PENDING','OVERDUE') THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
    totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} = 'PAID' THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
    totalWaived: sql<number>`COALESCE(SUM(${fees.waivedAmount}::numeric), 0)`,
  }).from(fees).where(eq(fees.studentUserId, studentUserId));
  return { totalDue: Number(s?.totalDue || 0), totalPaid: Number(s?.totalPaid || 0), totalWaived: Number(s?.totalWaived || 0) };
}
