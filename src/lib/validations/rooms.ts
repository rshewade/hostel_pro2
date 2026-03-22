import { z } from 'zod';

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1),
  vertical: z.enum(['BOYS', 'GIRLS', 'DHARAMSHALA', 'BOYS_HOSTEL', 'GIRLS_ASHRAM']),
  block: z.string().optional(),
  floor: z.number().int().optional(),
  capacity: z.number().int().min(1).default(2),
  amenities: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export const allocateRoomSchema = z.object({
  studentUserId: z.string().uuid(),
  roomId: z.string().uuid(),
  notes: z.string().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type AllocateRoomInput = z.infer<typeof allocateRoomSchema>;
