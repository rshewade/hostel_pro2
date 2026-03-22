import { db } from '@/lib/db';
import { rooms, roomAllocations } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '@/lib/errors';
import type { CreateRoomInput, AllocateRoomInput } from '@/lib/validations/rooms';

export async function createRoom(data: CreateRoomInput, _createdBy: string) {
  const [room] = await db.insert(rooms).values(data).returning();
  return room;
}

export async function getRoomById(id: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
  if (!room) throw new NotFoundError('Room not found');
  return room;
}

export async function listRooms(options: { vertical?: string; status?: string; page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = options;
  const conditions = [];
  if (options.vertical) conditions.push(eq(rooms.vertical, options.vertical as any));
  if (options.status) conditions.push(eq(rooms.status, options.status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db.select().from(rooms).where(where).orderBy(rooms.roomNumber).limit(limit).offset((page - 1) * limit);
  const [c] = await db.select({ count: sql<number>`count(*)` }).from(rooms).where(where);
  return { data, total: Number(c.count) };
}

export async function allocateRoom(data: AllocateRoomInput, allocatedBy: string) {
  const room = await getRoomById(data.roomId);
  if (room.occupiedCount >= room.capacity) throw new ConflictError('Room is at full capacity');

  const [existing] = await db.select().from(roomAllocations)
    .where(and(eq(roomAllocations.studentUserId, data.studentUserId), eq(roomAllocations.status, 'ACTIVE')));
  if (existing) throw new ConflictError('Student already has an active room allocation');

  const [alloc] = await db.insert(roomAllocations).values({
    studentUserId: data.studentUserId, roomId: data.roomId, allocatedBy, status: 'ACTIVE', notes: data.notes,
  }).returning();
  return alloc;
}

export async function endAllocation(allocationId: string, endedBy: string) {
  const [alloc] = await db.update(roomAllocations).set({ status: 'CHECKED_OUT', vacatedAt: new Date(), vacatedBy: endedBy })
    .where(eq(roomAllocations.id, allocationId)).returning();
  if (!alloc) throw new NotFoundError('Allocation not found');
  return alloc;
}

export async function getStudentAllocation(studentUserId: string) {
  const [alloc] = await db.select().from(roomAllocations)
    .where(and(eq(roomAllocations.studentUserId, studentUserId), eq(roomAllocations.status, 'ACTIVE')));
  return alloc || null;
}

export async function getRoomAvailability(vertical?: string) {
  const conditions = [];
  if (vertical) conditions.push(eq(rooms.vertical, vertical as any));
  return db.select({ id: rooms.id, roomNumber: rooms.roomNumber, vertical: rooms.vertical, capacity: rooms.capacity, occupiedCount: rooms.occupiedCount, status: rooms.status })
    .from(rooms).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(rooms.roomNumber);
}
