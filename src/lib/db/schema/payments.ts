import { pgTable, uuid, text, decimal, timestamp, jsonb, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { paymentStatusEnum, paymentMethodEnum } from './enums';
import { users } from './users';
import { fees } from './fees';

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  feeId: uuid('fee_id').references(() => fees.id),
  studentUserId: uuid('student_user_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method'),
  transactionId: text('transaction_id'),
  gatewayReference: text('gateway_reference'),
  status: paymentStatusEnum('status').notNull().default('PENDING'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  receiptUrl: text('receipt_url'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_payments_fee_id').on(table.feeId),
  index('idx_payments_student_user_id').on(table.studentUserId),
  index('idx_payments_status').on(table.status),
  index('idx_payments_transaction_id').on(table.transactionId),
  index('idx_payments_paid_at').on(table.paidAt),
  check('chk_payments_amount', sql`${table.amount} > 0`),
]);
