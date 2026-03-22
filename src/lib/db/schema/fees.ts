import { pgTable, uuid, text, decimal, date, timestamp, jsonb, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { feeHeadEnum, paymentStatusEnum } from './enums';
import { users } from './users';
import { applications } from './applications';

export const fees = pgTable('fees', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentUserId: uuid('student_user_id').notNull().references(() => users.id),
  applicationId: uuid('application_id').references(() => applications.id),
  head: feeHeadEnum('head').notNull(),
  name: text('name'),
  description: text('description'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  dueDate: date('due_date').notNull(),
  status: paymentStatusEnum('status').notNull().default('PENDING'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  receiptNumber: text('receipt_number').unique(),
  waivedAmount: decimal('waived_amount', { precision: 12, scale: 2 }).default('0'),
  waivedBy: uuid('waived_by').references(() => users.id),
  waivedReason: text('waived_reason'),
  periodStart: date('period_start'),
  periodEnd: date('period_end'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_fees_student_user_id').on(table.studentUserId),
  index('idx_fees_application_id').on(table.applicationId),
  index('idx_fees_status').on(table.status),
  index('idx_fees_due_date').on(table.dueDate),
  index('idx_fees_head').on(table.head),
  index('idx_fees_receipt_number').on(table.receiptNumber),
  check('chk_fees_amount', sql`${table.amount} >= 0`),
]);
