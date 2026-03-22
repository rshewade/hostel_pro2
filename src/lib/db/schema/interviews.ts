import { pgTable, uuid, date, time, text, integer, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { interviewModeEnum, interviewStatusEnum } from './enums';
import { users } from './users';
import { applications } from './applications';

export const interviews = pgTable('interviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  scheduledDate: date('scheduled_date'),
  scheduledTime: time('scheduled_time'),
  mode: interviewModeEnum('mode'),
  meetingLink: text('meeting_link'),
  location: text('location'),
  superintendentId: uuid('superintendent_id').references(() => users.id),
  trusteeId: uuid('trustee_id').references(() => users.id),
  status: interviewStatusEnum('status').notNull().default('SCHEDULED'),
  finalScore: integer('final_score'),
  notes: text('notes'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_interviews_application_id').on(table.applicationId),
  index('idx_interviews_status').on(table.status),
  check('chk_interviews_score', sql`${table.finalScore} IS NULL OR (${table.finalScore} >= 0 AND ${table.finalScore} <= 100)`),
]);
