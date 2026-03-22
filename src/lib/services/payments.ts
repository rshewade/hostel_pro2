import { db } from '@/lib/db';
import { fees, payments } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type { CreateFeeInput, RecordPaymentInput } from '@/lib/validations/payments';

export async function createFee(data: CreateFeeInput) {
  const [fee] = await db.insert(fees).values({
    studentUserId: data.studentUserId,
    applicationId: data.applicationId,
    head: data.head,
    name: data.name,
    description: data.description,
    amount: String(data.amount),
    dueDate: data.dueDate,
    status: 'PENDING',
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
    feeId: data.feeId,
    studentUserId: data.studentUserId,
    amount: String(data.amount),
    paymentMethod: data.paymentMethod,
    transactionId: data.transactionId,
    status: 'PAID',
    paidAt: new Date(),
    notes: data.notes,
  }).returning();
  return payment;
}

export async function getPaymentById(id: string) {
  const [payment] = await db.select().from(payments).where(eq(payments.id, id));
  if (!payment) throw new NotFoundError('Payment not found');
  return payment;
}

export async function generateReceiptNumber(): Promise<string> {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments)
    .where(sql`EXTRACT(YEAR FROM ${payments.createdAt}) = ${now.getFullYear()} AND EXTRACT(MONTH FROM ${payments.createdAt}) = ${now.getMonth() + 1}`);

  const seq = String(Number(result.count) + 1).padStart(5, '0');
  return `RCP-${yearMonth}-${seq}`;
}

export async function listFees(options: { studentUserId?: string; status?: string; page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = options;
  const conditions = [];
  if (options.studentUserId) conditions.push(eq(fees.studentUserId, options.studentUserId));
  if (options.status) conditions.push(eq(fees.status, options.status as any));

  const data = await db.select().from(fees)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(fees.createdAt))
    .limit(limit).offset((page - 1) * limit);

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(fees)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { data, total: Number(countResult.count) };
}

export async function getPaymentSummary(studentUserId: string) {
  const [summary] = await db
    .select({
      totalDue: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} IN ('PENDING', 'OVERDUE') THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
      totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} = 'PAID' THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
      totalWaived: sql<number>`COALESCE(SUM(${fees.waivedAmount}::numeric), 0)`,
    })
    .from(fees)
    .where(eq(fees.studentUserId, studentUserId));

  return {
    totalDue: Number(summary?.totalDue || 0),
    totalPaid: Number(summary?.totalPaid || 0),
    totalWaived: Number(summary?.totalWaived || 0),
  };
}
