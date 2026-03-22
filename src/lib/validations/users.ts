import { z } from 'zod';

export const createUserProfileSchema = z.object({
  betterAuthUserId: z.string().uuid(),
  role: z.enum(['STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'PARENT']),
  vertical: z.enum(['BOYS', 'GIRLS', 'DHARAMSHALA', 'BOYS_HOSTEL', 'GIRLS_ASHRAM']).optional(),
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  mobile: z.string().min(10),
  parentMobile: z.string().min(10).optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  mobile: z.string().min(10).optional(),
  parentMobile: z.string().min(10).optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
