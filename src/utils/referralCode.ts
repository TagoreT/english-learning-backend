import { nanoid, customAlphabet } from 'nanoid';

/**
 * Generate a unique referral code
 */
export const generateReferralCode = (): string => {
  // Use only uppercase letters and numbers, excluding similar-looking characters
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const generateCode = customAlphabet(alphabet, 8);
  return generateCode();
};

/**
 * Generate a unique verification token
 */
export const generateVerificationToken = (): string => {
  return nanoid(32);
};

/**
 * Generate a unique reset password token
 */
export const generateResetToken = (): string => {
  return nanoid(32);
};
