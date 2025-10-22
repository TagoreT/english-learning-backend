import { z } from 'zod';

// Create subscription schema
export const createSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  couponCode: z.string().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

// Create plan schema (Admin only)
export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  interval: z.enum(['monthly', 'yearly', 'lifetime']),
  price: z.number().min(0),
  trialDays: z.number().int().min(0).default(0),
  features: z.record(z.any()).default({}),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

// Update plan schema
export const updatePlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  interval: z.enum(['monthly', 'yearly', 'lifetime']).optional(),
  price: z.number().min(0).optional(),
  trialDays: z.number().int().min(0).optional(),
  features: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

// Cancel subscription schema
export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;

// Alias for backward compatibility
export const subscribeSchema = createSubscriptionSchema;

// Change plan schema
export const changePlanSchema = z.object({
  newPlanId: z.string().uuid(),
});

export type ChangePlanInput = z.infer<typeof changePlanSchema>;
