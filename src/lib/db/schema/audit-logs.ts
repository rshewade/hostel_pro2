import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityType: text('entity_type'),
  action: text('action'),
  entityId: uuid('entity_id'),
  actorId: uuid('actor_id'),
  actorRole: text('actor_role'),
  actorEmail: text('actor_email'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_audit_logs_entity').on(table.entityType, table.entityId),
  index('idx_audit_logs_actor_created').on(table.actorId, table.createdAt),
  index('idx_audit_logs_created_at').on(table.createdAt),
]);
