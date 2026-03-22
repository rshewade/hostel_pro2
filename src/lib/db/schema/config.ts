import { pgTable, uuid, varchar, integer, boolean, text, date, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const leaveTypes = pgTable('leave_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  maxDays: integer('max_days'),
  requiresApproval: boolean('requires_approval').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_leave_types_is_active').on(table.isActive),
  index('idx_leave_types_name').on(table.name),
]);

export const blackoutDates = pgTable('blackout_dates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  verticals: text('verticals').array(),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_blackout_dates_range').on(table.startDate, table.endDate),
  check('chk_blackout_end_after_start', sql`${table.endDate} >= ${table.startDate}`),
]);
