import { z } from 'zod';

// Apply referral code schema (during registration)
export const applyReferralSchema = z.object({
  referralCode: z
    .string()
    .min(6, 'Referral code must be at least 6 characters')
    .max(20, 'Referral code must not exceed 20 characters')
    .toUpperCase(),
});

export type ApplyReferralInput = z.infer<typeof applyReferralSchema>;

// Claim referral reward schema
export const claimReferralRewardSchema = z.object({
  referralId: z.string().uuid('Invalid referral ID'),
});

export type ClaimReferralRewardInput = z.infer<typeof claimReferralRewardSchema>;
