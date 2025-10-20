import { prisma } from '../config/database';
import { JwtHelper, TokenPair } from '../utils/jwtHelper';
import { PasswordHelper } from '../utils/password';
import { emailService } from '../utils/email';
import { generateReferralCode, generateVerificationToken, generateResetToken } from '../utils/referralCode';
import { cacheSet, cacheDel } from '../config/redis';
import {
  AuthenticationError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../utils/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { ErrorCode } from '../constants/errorCodes';
import { env } from '../config/env';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    fullName: string;
    password: string;
    referralCode?: string;
  }): Promise<{ user: any; tokens: TokenPair }> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    // Validate referral code if provided
    let referrer = null;
    if (data.referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode: data.referralCode },
      });

      if (!referrer) {
        throw new ValidationError(ERROR_MESSAGES.INVALID_REFERRAL_CODE);
      }
    }

    // Hash password
    const hashedPassword = await PasswordHelper.hash(data.password);

    // Generate verification token and referral code
    const verificationToken = generateVerificationToken();
    const referralCode = generateReferralCode();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        hashedPassword,
        referralCode,
        verificationToken,
        profile: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        referralCode: true,
        createdAt: true,
      },
    });

    // Create referral record if referral code was used
    if (referrer) {
      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          refereeId: user.id,
          rewardAmount: env.REFERRAL_REWARD_AMOUNT,
          status: 'PENDING',
        },
      });
    }

    // Generate tokens
    const tokens = JwtHelper.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);

    return { user, tokens };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: any; tokens: TokenPair }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        hashedPassword: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new AuthenticationError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Verify password
    const isValidPassword = await PasswordHelper.compare(password, user.hashedPassword);

    if (!isValidPassword) {
      throw new AuthenticationError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Generate tokens
    const tokens = JwtHelper.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Cache user data
    const cacheKey = `user:${user.id}`;
    await cacheSet(cacheKey, JSON.stringify(user), 300);

    // Remove password from response
    const { hashedPassword, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    const payload = JwtHelper.verifyRefreshToken(refreshToken);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AuthenticationError(ERROR_MESSAGES.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    // Generate new token pair
    const tokens = JwtHelper.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return tokens;
  }

  /**
   * Logout user (blacklist token)
   */
  async logout(accessToken: string): Promise<void> {
    // Get token expiration
    const expiration = JwtHelper.getTokenExpiration(accessToken);

    if (expiration) {
      const ttl = expiration - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await cacheSet(`blacklist:${accessToken}`, '1', ttl);
      }
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new AuthenticationError(
        ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN,
        ErrorCode.INVALID_VERIFICATION_TOKEN
      );
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    // Process pending referral rewards
    const pendingReferral = await prisma.referral.findFirst({
      where: {
        refereeId: user.id,
        status: 'PENDING',
      },
      include: {
        referrer: true,
      },
    });

    if (pendingReferral) {
      // Credit rewards in a transaction
      await prisma.$transaction([
        // Update referral status
        prisma.referral.update({
          where: { id: pendingReferral.id },
          data: { status: 'COMPLETED' },
        }),
        // Credit referrer
        prisma.user.update({
          where: { id: pendingReferral.referrerId },
          data: {
            walletBalance: { increment: env.REFERRER_BONUS_AMOUNT },
          },
        }),
        // Credit referee
        prisma.user.update({
          where: { id: user.id },
          data: {
            walletBalance: { increment: env.REFERRAL_REWARD_AMOUNT },
          },
        }),
        // Create transaction records
        prisma.transaction.create({
          data: {
            userId: pendingReferral.referrerId,
            amount: env.REFERRER_BONUS_AMOUNT,
            type: 'REFERRAL_BONUS',
            status: 'COMPLETED',
          },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            amount: env.REFERRAL_REWARD_AMOUNT,
            type: 'REFERRAL_BONUS',
            status: 'COMPLETED',
          },
        }),
      ]);
    }

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.fullName);
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    await emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AuthenticationError(
        ERROR_MESSAGES.INVALID_RESET_TOKEN,
        ErrorCode.INVALID_RESET_TOKEN
      );
    }

    const hashedPassword = await PasswordHelper.hash(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Invalidate user cache
    await cacheDel(`user:${user.id}`);
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const isValidPassword = await PasswordHelper.compare(currentPassword, user.hashedPassword);

    if (!isValidPassword) {
      throw new AuthenticationError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    const hashedPassword = await PasswordHelper.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    // Invalidate user cache
    await cacheDel(`user:${userId}`);
  }
}

export const authService = new AuthService();
