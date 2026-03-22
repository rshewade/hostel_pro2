import { pgTable, uuid, varchar, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const applicationsArchive = pgTable('applications_archive', {
  id: uuid('id').defaultRandom().primaryKey(),
  originalId: uuid('original_id').notNull(),
  trackingNumber: varchar('tracking_number', { length: 50 }),
  type: varchar('type', { length: 20 }),
  vertical: varchar('vertical', { length: 20 }),
  status: varchar('status', { length: 20 }),
  appliedAt: timestamp('applied_at', { withTimezone: true }),
  archivedAt: timestamp('archived_at', { withTimezone: true }).defaultNow(),
  archiveReason: varchar('archive_reason', { length: 100 }),
  summaryData: jsonb('summary_data'),
}, (table) => [
  index('idx_applications_archive_original_id').on(table.originalId),
  index('idx_applications_archive_tracking_number').on(table.trackingNumber),
  index('idx_applications_archive_archived_at').on(table.archivedAt),
  index('idx_applications_archive_vertical').on(table.vertical),
]);
