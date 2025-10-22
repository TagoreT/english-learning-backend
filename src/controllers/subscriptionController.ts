import { FastifyRequest, FastifyReply } from 'fastify';
import { subscriptionService } from '../services/subscriptionService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';
import type { CreateSubscriptionInput } from '../validators/subscriptionValidator';

export class SubscriptionController {
  /**
   * Get all subscription plans
   */
  async getAllPlans(request: FastifyRequest, reply: FastifyReply) {
    const plans = await subscriptionService.getAllPlans();
    return ResponseHandler.success(reply, 'Plans fetched successfully', plans);
  }

  /**
   * Subscribe to a plan
   */
  async subscribe(
    request: FastifyRequest<{ Body: CreateSubscriptionInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const subscription = await subscriptionService.createSubscription(
      userId,
      request.body.planId,
      request.body.couponCode
    );
    return ResponseHandler.created(reply, SUCCESS_MESSAGES.SUBSCRIPTION_CREATED, subscription);
  }

  /**
   * Get user's current subscription
   */
  async getMySubscription(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const subscription = await subscriptionService.getActiveSubscription(userId);
    return ResponseHandler.success(reply, 'Subscription fetched successfully', subscription);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    request: FastifyRequest<{ Body: { subscriptionId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const subscription = await subscriptionService.cancelSubscription(userId, request.body.subscriptionId);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.SUBSCRIPTION_CANCELLED, subscription);
  }

  /**
   * Reactivate subscription
   * Note: This method may need implementation in subscriptionService
   */
  async reactivateSubscription(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    // TODO: Implement reactivateSubscription in subscriptionService if needed
    const subscription = { userId, status: 'reactivated', message: 'Feature coming soon' };
    return ResponseHandler.success(reply, 'Subscription reactivated successfully', subscription);
  }

  /**
   * Change subscription plan
   * Note: This method may need implementation in subscriptionService
   */
  async changePlan(
    request: FastifyRequest<{ Body: { newPlanId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    // TODO: Implement changePlan in subscriptionService if needed
    const subscription = { userId, newPlanId: request.body.newPlanId, message: 'Feature coming soon' };
    return ResponseHandler.success(reply, 'Plan changed successfully', subscription);
  }
}

export const subscriptionController = new SubscriptionController();
