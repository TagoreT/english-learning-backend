import { z } from 'zod';

// Create coupon schema (Admin only)
export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(50, 'Coupon code must not exceed 50 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Coupon code must contain only uppercase letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase()),
  discountType: z.enum(['PERCENTAGE', 'FIXED'], {
    errorMap: () => ({ message: 'Discount type must be either PERCENTAGE or FIXED' }),
  }),
  value: z.number().positive('Discount value must be positive'),
  expiresAt: z.string().datetime().optional(),
  usageLimit: z.number().int().positive().optional(),
  multiTier: z.record(z.any()).optional(),
  description: z.string().max(500).optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

// Validate coupon schema
export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase(),
  amount: z.number().positive('Amount must be positive'),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

// Update coupon schema (Admin only)
export const updateCouponSchema = z.object({
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(500).optional(),
});

export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
