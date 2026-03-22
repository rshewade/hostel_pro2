import { pgTable, uuid, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { notificationTypeEnum } from './enums';
import { users } from './users';

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: uuid('related_entity_id'),
  actionUrl: text('action_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
}, (table) => [
  index('idx_notifications_user_id').on(table.userId),
  index('idx_notifications_user_read').on(table.userId, table.read),
  index('idx_notifications_type').on(table.type),
  index('idx_notifications_created_at').on(table.createdAt),
]);

export const notificationRules = pgTable('notification_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: text('event_type'),
  timing: text('timing').default('IMMEDIATE'),
  channels: jsonb('channels'), // { sms: boolean, whatsapp: boolean, email: boolean }
  verticals: text('verticals').array(),
  template: text('template').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_notification_rules_event_type').on(table.eventType),
  index('idx_notification_rules_is_active').on(table.isActive),
]);
