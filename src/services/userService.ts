import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { ErrorCode } from '../constants/errorCodes';
import { cacheGet, cacheSet, cacheDel } from '../config/redis';

export class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<any> {
    // Try cache first
    const cacheKey = `user:full:${userId}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        referralCode: true,
        walletBalance: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    // Cache for 5 minutes
    await cacheSet(cacheKey, JSON.stringify(user), 300);

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      bio?: string;
      learningGoals?: string;
      languageLevel?: string;
      timezone?: string;
    }
  ): Promise<any> {
    const { fullName, bio, learningGoals, languageLevel, timezone } = data;

    // Update user and profile in transaction
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        profile: {
          update: {
            ...(bio !== undefined && { bio }),
            ...(learningGoals !== undefined && { learningGoals }),
            ...(languageLevel && { languageLevel: languageLevel as any }),
            ...(timezone && { timezone }),
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Invalidate cache
    await cacheDel(`user:full:${userId}`);
    await cacheDel(`user:${userId}`);

    return user;
  }

  /**
   * Update avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<any> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    // Invalidate cache
    await cacheDel(`user:full:${userId}`);
    await cacheDel(`user:${userId}`);

    return user;
  }

  /**
   * Get user wallet balance
   */
  async getWalletBalance(userId: string): Promise<{ balance: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    return { balance: user.walletBalance };
  }

  /**
   * Get user transactions
   */
  async getTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ transactions: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    return { transactions, total };
  }

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<{ users: any[]; total: number }> {
    const { page = 1, limit = 10, search, role } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          isVerified: true,
          walletBalance: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Delete user (Admin or self)
   */
  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });

    // Invalidate cache
    await cacheDel(`user:full:${userId}`);
    await cacheDel(`user:${userId}`);
  }

  /**
   * Get user stats
   */
  async getUserStats(userId: string): Promise<any> {
    const [quizAttempts, enrollments, pronunciations] = await Promise.all([
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.courseEnrollment.count({ where: { userId } }),
      prisma.pronunciation.count({ where: { userId } }),
    ]);

    return {
      quizAttempts,
      enrollments,
      pronunciations,
    };
  }
}

export const userService = new UserService();
