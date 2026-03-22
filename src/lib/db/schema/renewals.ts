import { pgTable, uuid, date, boolean, text, timestamp, jsonb, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { applicationStatusEnum } from './enums';
import { users } from './users';
import { applications } from './applications';

export const renewals = pgTable('renewals', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentUserId: uuid('student_user_id').notNull().references(() => users.id),
  applicationId: uuid('application_id').references(() => applications.id),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  status: applicationStatusEnum('status').notNull().default('DRAFT'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  approvedBy: uuid('approved_by').references(() => users.id),
  rejectedBy: uuid('rejected_by').references(() => users.id),
  rejectionReason: text('rejection_reason'),
  consentGiven: boolean('consent_given').default(false),
  consentGivenAt: timestamp('consent_given_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_renewals_student_user_id').on(table.studentUserId),
  index('idx_renewals_application_id').on(table.applicationId),
  index('idx_renewals_status').on(table.status),
  check('chk_renewal_period', sql`${table.periodEnd} > ${table.periodStart}`),
]);
