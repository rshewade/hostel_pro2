import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { communicationTypeEnum, communicationStatusEnum } from './enums';
import { users } from './users';

export const communications = pgTable('communications', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: communicationTypeEnum('type').notNull(),
  template: text('template'),
  recipientId: uuid('recipient_id').references(() => users.id),
  recipientName: text('recipient_name'),
  recipientMobile: text('recipient_mobile'),
  recipientEmail: text('recipient_email'),
  subject: text('subject'),
  message: text('message').notNull(),
  status: communicationStatusEnum('status').notNull().default('PENDING'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  failedAt: timestamp('failed_at', { withTimezone: true }),
  failureReason: text('failure_reason'),
  provider: text('provider'),
  providerMessageId: text('provider_message_id'),
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: uuid('related_entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_communications_recipient_id').on(table.recipientId),
  index('idx_communications_type').on(table.type),
  index('idx_communications_status').on(table.status),
]);
