import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, index, unique, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { roomStatusEnum, allocationStatusEnum, verticalTypeEnum } from './enums';
import { users } from './users';

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomNumber: text('room_number').notNull(),
  vertical: verticalTypeEnum('vertical').notNull(),
  block: text('block'),
  floor: integer('floor'),
  capacity: integer('capacity').default(2).notNull(),
  occupiedCount: integer('occupied_count').default(0).notNull(),
  status: roomStatusEnum('status').notNull().default('AVAILABLE'),
  amenities: text('amenities').array(),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('uq_rooms_number_vertical').on(table.roomNumber, table.vertical),
  index('idx_rooms_vertical').on(table.vertical),
  index('idx_rooms_status').on(table.status),
  check('chk_rooms_occupied', sql`${table.occupiedCount} >= 0 AND ${table.occupiedCount} <= ${table.capacity}`),
]);

export const roomAllocations = pgTable('room_allocations', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentUserId: uuid('student_user_id').notNull().references(() => users.id),
  roomId: uuid('room_id').notNull().references(() => rooms.id),
  allocatedAt: timestamp('allocated_at', { withTimezone: true }).defaultNow(),
  vacatedAt: timestamp('vacated_at', { withTimezone: true }),
  allocatedBy: uuid('allocated_by').references(() => users.id),
  vacatedBy: uuid('vacated_by').references(() => users.id),
  status: allocationStatusEnum('status').notNull().default('ACTIVE'),
  checkInConfirmed: boolean('check_in_confirmed').default(false),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_room_allocations_student_user_id').on(table.studentUserId),
  index('idx_room_allocations_room_id').on(table.roomId),
  index('idx_room_allocations_status').on(table.status),
]);
