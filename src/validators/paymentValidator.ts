import { z } from 'zod';

// Create payment schema
export const createPaymentSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['SUBSCRIPTION', 'COURSE', 'WALLET_TOPUP']),
  metadata: z.record(z.any()).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

// Wallet withdrawal schema
export const createWithdrawalSchema = z.object({
  amount: z.number().positive(),
  notes: z.string().max(500).optional(),
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;

// Process withdrawal schema (Admin)
export const processWithdrawalSchema = z.object({
  withdrawalId: z.string().uuid(),
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().max(500).optional(),
});

export type ProcessWithdrawalInput = z.infer<typeof processWithdrawalSchema>;

// Apply coupon schema
export const applyCouponSchema = z.object({
  code: z.string().min(1),
  amount: z.number().positive(),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

// Create coupon schema (Admin)
export const createCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive(),
  expiresAt: z.string().datetime().optional(),
  usageLimit: z.number().int().positive().optional(),
  multiTier: z.record(z.any()).optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
