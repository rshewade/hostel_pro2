import { z } from 'zod';

export const createFeeSchema = z.object({
  studentUserId: z.string().uuid(),
  applicationId: z.string().uuid().optional(),
  head: z.enum(['PROCESSING_FEE', 'SECURITY_DEPOSIT', 'HOSTEL_FEE', 'MESS_FEE', 'MAINTENANCE_FEE', 'ELECTRICITY_FEE', 'LAUNDRY_FEE', 'LATE_FEE', 'DAMAGE_CHARGE', 'OTHER']),
  name: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().positive(),
  dueDate: z.string(),
});

export const recordPaymentSchema = z.object({
  feeId: z.string().uuid().optional(),
  studentUserId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'DEMAND_DRAFT', 'CARD', 'OTHER']).optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(['PAID', 'REFUNDED']),
});

export type CreateFeeInput = z.infer<typeof createFeeSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
