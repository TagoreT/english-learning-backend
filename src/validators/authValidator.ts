import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../constants/messages';

// Password validation schema with strength requirements
const passwordSchema = z
  .string()
  .min(8, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    VALIDATION_MESSAGES.PASSWORD_WEAK
  );

// Register schema
export const registerSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID),
  fullName: z.string().min(2, VALIDATION_MESSAGES.NAME_MIN_LENGTH),
  password: passwordSchema,
  referralCode: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID),
  password: z.string().min(1, VALIDATION_MESSAGES.PASSWORD_REQUIRED),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Verify email schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
