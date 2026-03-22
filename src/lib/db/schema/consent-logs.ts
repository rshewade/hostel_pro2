import { pgTable, uuid, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const consentLogs = pgTable('consent_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  consentType: text('consent_type'),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  grantedAt: timestamp('granted_at', { withTimezone: true }),
  consentTextHash: varchar('consent_text_hash', { length: 64 }),
  deviceInfo: text('device_info'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedReason: text('revoked_reason'),
}, (table) => [
  index('idx_consent_logs_user_id').on(table.userId),
  index('idx_consent_logs_consent_type').on(table.consentType),
]);
