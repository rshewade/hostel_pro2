import { z } from 'zod';

export const createLeaveSchema = z.object({
  type: z.enum(['HOME_VISIT', 'SHORT_LEAVE', 'MEDICAL', 'EMERGENCY', 'OTHER']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.string().optional(),
  destination: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'CANCELLED']),
  rejectionReason: z.string().optional(),
});

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type UpdateLeaveStatusInput = z.infer<typeof updateLeaveStatusSchema>;
