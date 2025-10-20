import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { ErrorCode } from '../constants/errorCodes';
import { emailService } from '../utils/email';

export class SubscriptionService {
  /**
   * Create subscription
   */
  async createSubscription(
    userId: string,
    planId: string,
    _couponCode?: string
  ): Promise<any> {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundError(
        ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND,
        ErrorCode.SUBSCRIPTION_NOT_FOUND
      );
    }

    // Check for active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gt: new Date(),
        },
      },
    });

    if (activeSubscription) {
      throw new ConflictError(
        ERROR_MESSAGES.SUBSCRIPTION_ALREADY_ACTIVE,
        ErrorCode.SUBSCRIPTION_ALREADY_ACTIVE
      );
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (plan.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Add trial days
    if (plan.trialDays > 0) {
      endDate.setDate(endDate.getDate() + plan.trialDays);
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: plan.trialDays > 0 ? 'TRIAL' : 'ACTIVE',
        startDate,
        endDate,
      },
      include: {
        plan: true,
      },
    });

    // Send confirmation email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await emailService.sendSubscriptionConfirmation(user.email, plan.name, endDate);
    }

    return subscription;
  }

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<any[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions;
  }

  /**
   * Get active subscription
   */
  async getActiveSubscription(userId: string): Promise<any | null> {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'TRIAL'] },
        endDate: {
          gt: new Date(),
        },
      },
      include: {
        plan: true,
      },
    });

    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, subscriptionId: string): Promise<any> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundError(
        ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND,
        ErrorCode.SUBSCRIPTION_NOT_FOUND
      );
    }

    if (subscription.userId !== userId) {
      throw new ConflictError(ERROR_MESSAGES.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
      },
    });

    return updated;
  }

  /**
   * Create plan (Admin only)
   */
  async createPlan(data: {
    name: string;
    interval: string;
    price: number;
    trialDays?: number;
    features?: any;
  }): Promise<any> {
    const plan = await prisma.plan.create({
      data,
    });

    return plan;
  }

  /**
   * Update plan (Admin only)
   */
  async updatePlan(planId: string, data: any): Promise<any> {
    const plan = await prisma.plan.update({
      where: { id: planId },
      data,
    });

    return plan;
  }

  /**
   * Get all plans
   */
  async getAllPlans(includeInactive = false): Promise<any[]> {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const plans = await prisma.plan.findMany({
      where,
      orderBy: { price: 'asc' },
    });

    return plans;
  }

  /**
   * Renew expired subscriptions (cron job)
   */
  async renewSubscriptions(): Promise<void> {
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        endDate: {
          lte: new Date(),
        },
        autoRenew: true,
      },
      include: {
        plan: true,
        user: true,
      },
    });

    for (const subscription of expiredSubscriptions) {
      // Calculate new end date
      const endDate = new Date();
      if (subscription.plan.interval === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (subscription.plan.interval === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Renew subscription
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          startDate: new Date(),
          endDate,
        },
      });

      // Send renewal email
      await emailService.sendSubscriptionConfirmation(
        subscription.user.email,
        subscription.plan.name,
        endDate
      );
    }
  }
}

export const subscriptionService = new SubscriptionService();
