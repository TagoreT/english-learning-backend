import { prisma } from '../config/database';
import { ReferralStatus, TransactionType, TransactionStatus } from '@prisma/client';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

interface ReferralReward {
  level1: number; // Direct referral reward
  level2: number; // Second level reward
  level3: number; // Third level reward
}

class ReferralService {
  // Configurable referral rewards (can be moved to database/config)
  private readonly REFERRAL_REWARDS: ReferralReward = {
    level1: 100, // Direct referral gets 100
    level2: 50, // Referrer of referrer gets 50
    level3: 25, // Third level gets 25
  };

  private readonly MIN_PURCHASE_FOR_REWARD = 500; // Minimum purchase to unlock referral rewards

  /**
   * Get user's referrals with stats
   * @param userId User ID
   */
  async getMyReferrals(userId: string) {
    // Get all direct referrals
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total earnings
    const totalEarnings = referrals.reduce((sum, ref) => sum + ref.rewardAmount, 0);

    // Count by status
    const pendingCount = referrals.filter((r) => r.status === ReferralStatus.PENDING).length;
    const completedCount = referrals.filter((r) => r.status === ReferralStatus.COMPLETED).length;
    const expiredCount = referrals.filter((r) => r.status === ReferralStatus.EXPIRED).length;

    return {
      referrals,
      stats: {
        total: referrals.length,
        pending: pendingCount,
        completed: completedCount,
        expired: expiredCount,
        totalEarnings,
      },
    };
  }

  /**
   * Get referral statistics
   * @param userId User ID
   */
  async getReferralStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        referralCode: true,
        walletBalance: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get all referrals
    const [directReferrals, totalEarned, pendingRewards] = await Promise.all([
      // Direct referrals count
      prisma.referral.count({
        where: { referrerId: userId },
      }),

      // Total earned from referrals
      prisma.referral.aggregate({
        where: {
          referrerId: userId,
          status: ReferralStatus.COMPLETED,
        },
        _sum: {
          rewardAmount: true,
        },
      }),

      // Pending rewards
      prisma.referral.aggregate({
        where: {
          referrerId: userId,
          status: ReferralStatus.PENDING,
        },
        _sum: {
          rewardAmount: true,
        },
      }),
    ]);

    return {
      referralCode: user.referralCode,
      referralLink: `${env.FRONTEND_URL}/register?ref=${user.referralCode}`,
      stats: {
        directReferrals,
        totalEarned: totalEarned._sum.rewardAmount || 0,
        pendingRewards: pendingRewards._sum.rewardAmount || 0,
        currentBalance: user.walletBalance,
      },
    };
  }

  /**
   * Process referral when referee makes qualifying purchase
   * This should be called after a successful purchase/subscription
   * @param refereeId Referee (new user) ID
   * @param purchaseAmount Purchase amount
   */
  async processReferralReward(refereeId: string, purchaseAmount: number) {
    // Check if purchase qualifies for referral reward
    if (purchaseAmount < this.MIN_PURCHASE_FOR_REWARD) {
      return null; // No reward for small purchases
    }

    // Find pending referral
    const referral = await prisma.referral.findFirst({
      where: {
        refereeId,
        status: ReferralStatus.PENDING,
      },
      include: {
        referrer: true,
      },
    });

    if (!referral) {
      return null; // No referral to process
    }

    // Process reward in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update referral status and amount
      const updatedReferral = await tx.referral.update({
        where: { id: referral.id },
        data: {
          status: ReferralStatus.COMPLETED,
          rewardAmount: this.REFERRAL_REWARDS.level1,
        },
      });

      // Add reward to referrer's wallet
      await tx.user.update({
        where: { id: referral.referrerId },
        data: {
          walletBalance: {
            increment: this.REFERRAL_REWARDS.level1,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: referral.referrerId,
          amount: this.REFERRAL_REWARDS.level1,
          type: TransactionType.REFERRAL_REWARD,
          status: TransactionStatus.COMPLETED,
          metadata: {
            referralId: referral.id,
            refereeId,
            rewardType: 'LEVEL_1',
            completedAt: new Date().toISOString(),
          },
        },
      });

      // TODO: Process multi-tier rewards (level 2, level 3)
      // This would involve finding the referrer's referrer and so on

      return { updatedReferral, transaction };
    });

    return result;
  }

  /**
   * Create referral relationship when new user signs up with referral code
   * @param refereeId New user ID
   * @param referralCode Referral code used
   */
  async createReferralRelationship(refereeId: string, referralCode: string) {
    // Find referrer by code
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      throw new AppError('Invalid referral code', 400);
    }

    // Prevent self-referral
    if (referrer.id === refereeId) {
      throw new AppError('Cannot use your own referral code', 400);
    }

    // Check if referee already has a referral
    const existingReferral = await prisma.referral.findFirst({
      where: { refereeId },
    });

    if (existingReferral) {
      throw new AppError('User already registered with a referral code', 400);
    }

    // Create referral record (pending until first purchase)
    const referral = await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        refereeId,
        status: ReferralStatus.PENDING,
        rewardAmount: 0, // Will be updated when referee makes purchase
      },
      include: {
        referrer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      referral,
      message: `Successfully applied referral code from ${referrer.fullName}`,
    };
  }

  /**
   * Claim referral rewards (manual claim if needed)
   * @param userId User ID
   * @param referralId Referral ID to claim
   */
  async claimReferralReward(userId: string, referralId: string) {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral) {
      throw new AppError('Referral not found', 404);
    }

    if (referral.referrerId !== userId) {
      throw new AppError('Unauthorized to claim this referral reward', 403);
    }

    if (referral.status !== ReferralStatus.COMPLETED) {
      throw new AppError('Referral reward not yet available', 400);
    }

    // Check if already claimed
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        userId,
        type: TransactionType.REFERRAL_REWARD,
        metadata: {
          path: ['referralId'],
          equals: referralId,
        },
      },
    });

    if (existingTransaction) {
      throw new AppError('Referral reward already claimed', 400);
    }

    // Process claim
    const result = await prisma.$transaction(async (tx) => {
      // Add to wallet
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: referral.rewardAmount,
          },
        },
      });

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: referral.rewardAmount,
          type: TransactionType.REFERRAL_REWARD,
          status: TransactionStatus.COMPLETED,
          metadata: {
            referralId,
            claimedAt: new Date().toISOString(),
          },
        },
      });

      return transaction;
    });

    return {
      claimed: true,
      amount: referral.rewardAmount,
      transaction: result,
    };
  }

  /**
   * Get referral leaderboard (top referrers)
   * @param limit Number of top referrers to return
   */
  async getReferralLeaderboard(limit: number = 10) {
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        _count: {
          select: {
            referrals: {
              where: {
                status: ReferralStatus.COMPLETED,
              },
            },
          },
        },
      },
      orderBy: {
        referrals: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return leaderboard.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      totalReferrals: user._count.referrals,
    }));
  }
}

export const referralService = new ReferralService();
