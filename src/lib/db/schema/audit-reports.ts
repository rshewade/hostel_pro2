import { pgTable, uuid, varchar, text, timestamp, jsonb, unique } from 'drizzle-orm/pg-core';

export const auditReports = pgTable('audit_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportMonth: varchar('report_month', { length: 7 }).notNull(),
  reportUrl: text('report_url').notNull(),
  summary: jsonb('summary'),
  generatedAt: timestamp('generated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('uq_audit_reports_month').on(table.reportMonth),
]);
