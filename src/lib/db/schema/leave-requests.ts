import { pgTable, uuid, text, boolean, timestamp, jsonb, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { leaveTypeEnum, leaveStatusEnum } from './enums';
import { users } from './users';

export const leaveRequests = pgTable('leave_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentUserId: uuid('student_user_id').notNull().references(() => users.id),
  type: leaveTypeEnum('type').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  reason: text('reason'),
  destination: text('destination'),
  emergencyContact: text('emergency_contact'),
  status: leaveStatusEnum('status').notNull().default('PENDING'),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectedBy: uuid('rejected_by').references(() => users.id),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  parentNotified: boolean('parent_notified').default(false),
  checkOutTime: timestamp('check_out_time', { withTimezone: true }),
  checkInTime: timestamp('check_in_time', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_leave_requests_student_user_id').on(table.studentUserId),
  index('idx_leave_requests_status').on(table.status),
  check('chk_leave_end_after_start', sql`${table.endTime} > ${table.startTime}`),
]);
