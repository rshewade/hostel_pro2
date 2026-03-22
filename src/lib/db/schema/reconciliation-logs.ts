import { pgTable, uuid, date, integer, decimal, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const reconciliationLogs = pgTable('reconciliation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  reconciliationDate: date('reconciliation_date').notNull(),
  totalPayments: integer('total_payments').default(0),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).default('0'),
  settlementsMatched: integer('settlements_matched').default(0),
  discrepanciesCount: integer('discrepancies_count').default(0),
  discrepancies: jsonb('discrepancies'),
  status: varchar('status', { length: 20 }).notNull().default('SUCCESS'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_reconciliation_logs_date').on(table.reconciliationDate),
]);
