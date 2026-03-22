import { z } from 'zod';

export const createApplicationSchema = z.object({
  applicantName: z.string().min(1, 'Full name is required'),
  applicantMobile: z.string().min(10, 'Valid mobile number required'),
  applicantEmail: z.string().email('Valid email required'), // REQUIRED (CHANGE-3)
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  vertical: z.enum(['BOYS', 'GIRLS', 'DHARAMSHALA', 'BOYS_HOSTEL', 'GIRLS_ASHRAM']),
  type: z.enum(['NEW', 'RENEWAL']).default('NEW'),
  data: z.record(z.unknown()).optional(),
});

export const updateApplicationSchema = z.object({
  applicantName: z.string().min(1).optional(),
  applicantMobile: z.string().min(10).optional(),
  applicantEmail: z.string().email().optional(),
  data: z.record(z.unknown()).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['REVIEW', 'INTERVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED']),
  rejectionReason: z.string().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
