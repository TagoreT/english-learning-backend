import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { paymentController } from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/auth';
import { zodValidationMiddleware } from '../middlewares/zodValidation';
import {
  createPaymentSchema,
  createWithdrawalSchema,
  applyCouponSchema,
} from '../validators/paymentValidator';

export async function paymentRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Apply auth middleware to all routes
  fastify.addHook('onRequest', authMiddleware);

  /**
   * @route POST /api/v1/payments/wallet/add
   * @desc Add money to wallet
   * @access Private
   */
  fastify.post(
    '/wallet/add',
    {
      preHandler: zodValidationMiddleware(
        z.object({
          amount: z.number().positive('Amount must be positive'),
          paymentMethod: z
            .enum(['stripe', 'razorpay', 'card', 'upi', 'netbanking'])
            .default('stripe'),
        })
      ),
      schema: {
        tags: ['Payment'],
        description: 'Add money to wallet',
        body: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'number', minimum: 1 },
            paymentMethod: {
              type: 'string',
              enum: ['stripe', 'razorpay', 'card', 'upi', 'netbanking'],
              default: 'stripe',
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    paymentController.addMoney
  );

  /**
   * @route POST /api/v1/payments/withdrawal/request
   * @desc Request withdrawal from wallet
   * @access Private
   */
  fastify.post(
    '/withdrawal/request',
    {
      preHandler: zodValidationMiddleware(createWithdrawalSchema),
      schema: {
        tags: ['Payment'],
        description: 'Request withdrawal from wallet',
        body: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'number', minimum: 100 },
            notes: { type: 'string', maxLength: 500 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    paymentController.requestWithdrawal
  );

  /**
   * @route GET /api/v1/payments/history
   * @desc Get payment history
   * @access Private
   */
  fastify.get(
    '/history',
    {
      schema: {
        tags: ['Payment'],
        description: 'Get payment transaction history',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  transactions: { type: 'array' },
                  pagination: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    paymentController.getPaymentHistory
  );

  /**
   * @route POST /api/v1/payments/verify
   * @desc Verify payment (webhook handler)
   * @access Private
   */
  fastify.post(
    '/verify',
    {
      preHandler: zodValidationMiddleware(
        z.object({
          transactionId: z.string().uuid('Invalid transaction ID'),
          gatewayResponse: z.object({
            transactionId: z.string(),
            status: z.string(),
            amount: z.number(),
            currency: z.string(),
            paymentMethod: z.string(),
            metadata: z.any().optional(),
          }),
        })
      ),
      schema: {
        tags: ['Payment'],
        description: 'Verify payment from gateway webhook',
        body: {
          type: 'object',
          required: ['transactionId', 'gatewayResponse'],
          properties: {
            transactionId: { type: 'string', format: 'uuid' },
            gatewayResponse: { type: 'object' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    paymentController.verifyPayment
  );

  /**
   * @route GET /api/v1/payments/wallet/balance
   * @desc Get wallet balance
   * @access Private
   */
  fastify.get(
    '/wallet/balance',
    {
      schema: {
        tags: ['Payment'],
        description: 'Get current wallet balance',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  balance: { type: 'number' },
                  currency: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.userId;
      const { paymentService } = await import('../services/paymentService');
      const balance = await paymentService.getWalletBalance(userId);
      const { ResponseHandler } = await import('../utils/responseHandler');
      return ResponseHandler.success(reply, 'Wallet balance fetched', balance);
    }
  );
}

// Import z for inline validation
import { z } from 'zod';
