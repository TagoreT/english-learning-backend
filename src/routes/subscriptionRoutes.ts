import { FastifyInstance } from 'fastify';
import { subscriptionController } from '../controllers/subscriptionController';
import { authMiddleware } from '../middlewares/auth';
import { zodValidationMiddleware } from '../middlewares/zodValidation';
import { subscribeSchema, changePlanSchema } from '../validators/subscriptionValidator';

export async function subscriptionRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.get('/plans', {
    schema: {
      tags: ['Subscriptions'],
      description: 'Get all subscription plans',
    },
  }, subscriptionController.getAllPlans);

  // Protected routes
  fastify.post('/subscribe', {
    preHandler: [authMiddleware, zodValidationMiddleware(subscribeSchema)],
    schema: {
      tags: ['Subscriptions'],
      description: 'Subscribe to a plan',
    },
  }, subscriptionController.subscribe);

  fastify.get('/my-subscription', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Subscriptions'],
      description: 'Get my current subscription',
    },
  }, subscriptionController.getMySubscription);

  fastify.post('/cancel', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Subscriptions'],
      description: 'Cancel subscription',
    },
  }, subscriptionController.cancelSubscription);

  fastify.post('/reactivate', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Subscriptions'],
      description: 'Reactivate cancelled subscription',
    },
  }, subscriptionController.reactivateSubscription);

  fastify.post('/change-plan', {
    preHandler: [authMiddleware, zodValidationMiddleware(changePlanSchema)],
    schema: {
      tags: ['Subscriptions'],
      description: 'Change subscription plan',
    },
  }, subscriptionController.changePlan);
}
