import { pgTable, uuid, text, boolean, date, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { userRoleEnum, verticalTypeEnum } from './enums';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  betterAuthUserId: uuid('better_auth_user_id').unique(),
  role: userRoleEnum('role').notNull().default('STUDENT'),
  vertical: verticalTypeEnum('vertical'),
  fullName: text('full_name').notNull(),
  email: text('email').unique(),
  mobile: text('mobile').notNull(),
  parentMobile: text('parent_mobile'),
  address: text('address'),
  dateOfBirth: date('date_of_birth'),
  isActive: boolean('is_active').default(true).notNull(),
  requiresPasswordChange: boolean('requires_password_change').default(false).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_users_better_auth_user_id').on(table.betterAuthUserId),
  index('idx_users_role').on(table.role),
  index('idx_users_vertical').on(table.vertical),
  index('idx_users_mobile').on(table.mobile),
]);
