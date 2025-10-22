import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Update user role schema
export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Invalid user role' }),
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

// Generate report schema
export const generateReportSchema = z.object({
  reportType: z.enum(['USERS', 'COURSES', 'REVENUE', 'SUBSCRIPTIONS', 'TRANSACTIONS']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['JSON', 'CSV', 'PDF']).default('JSON'),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;

// Process withdrawal schema
export const processWithdrawalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().max(500).optional(),
});

export type ProcessWithdrawalInput = z.infer<typeof processWithdrawalSchema>;
