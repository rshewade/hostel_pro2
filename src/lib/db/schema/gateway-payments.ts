import { pgTable, uuid, varchar, text, decimal, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { applications } from './applications';
import { fees } from './fees';

export const gatewayPayments = pgTable('gateway_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentUserId: uuid('student_user_id').notNull().references(() => users.id),
  applicationId: uuid('application_id').references(() => applications.id),
  feeId: uuid('fee_id').references(() => fees.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  feeBreakdown: jsonb('fee_breakdown'),
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 255 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('INITIATED'),
  gatewayResponse: jsonb('gateway_response'),
  idempotencyKey: varchar('idempotency_key', { length: 64 }),
  receiptUrl: text('receipt_url'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  refundedAt: timestamp('refunded_at', { withTimezone: true }),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_gateway_payments_student_user_id').on(table.studentUserId),
  index('idx_gateway_payments_status').on(table.status),
  index('idx_gateway_payments_razorpay_order_id').on(table.razorpayOrderId),
]);
