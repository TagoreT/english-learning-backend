import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { couponController } from '../controllers/couponController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';
import { zodValidationMiddleware } from '../middlewares/zodValidation';
import {
  createCouponSchema,
  validateCouponSchema,
  updateCouponSchema,
} from '../validators/couponValidator';
import { UserRole } from '@prisma/client';

export async function couponRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Apply auth middleware to all routes
  fastify.addHook('onRequest', authMiddleware);

  /**
   * @route POST /api/v1/coupons/validate
   * @desc Validate a coupon code
   * @access Private
   */
  fastify.post(
    '/validate',
    {
      preHandler: zodValidationMiddleware(validateCouponSchema),
      schema: {
        tags: ['Coupon'],
        description: 'Validate a coupon code and calculate discount',
        body: {
          type: 'object',
          required: ['code', 'amount'],
          properties: {
            code: { type: 'string' },
            amount: { type: 'number', minimum: 0 },
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
                  valid: { type: 'boolean' },
                  coupon: { type: 'object' },
                  discount: { type: 'number' },
                  finalAmount: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    couponController.validateCoupon
  );

  /**
   * @route POST /api/v1/coupons
   * @desc Create a new coupon (Admin only)
   * @access Admin
   */
  fastify.post(
    '/',
    {
      preHandler: [roleMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]), zodValidationMiddleware(createCouponSchema)],
      schema: {
        tags: ['Coupon'],
        description: 'Create a new coupon (Admin only)',
        body: {
          type: 'object',
          required: ['code', 'discountType', 'value'],
          properties: {
            code: { type: 'string' },
            discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'] },
            value: { type: 'number', minimum: 0 },
            expiresAt: { type: 'string', format: 'date-time' },
            usageLimit: { type: 'number', minimum: 1 },
            multiTier: { type: 'object' },
            description: { type: 'string' },
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
    couponController.createCoupon
  );

  /**
   * @route GET /api/v1/coupons
   * @desc Get all coupons (Admin only)
   * @access Admin
   */
  fastify.get(
    '/',
    {
      preHandler: roleMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]),
      schema: {
        tags: ['Coupon'],
        description: 'Get all coupons with pagination and filters (Admin only)',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '10' },
            discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'] },
            expired: { type: 'string', enum: ['true', 'false'] },
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
                  coupons: { type: 'array' },
                  pagination: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    couponController.getAllCoupons
  );

  /**
   * @route GET /api/v1/coupons/:code
   * @desc Get coupon by code (Admin only)
   * @access Admin
   */
  fastify.get(
    '/:code',
    {
      preHandler: roleMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]),
      schema: {
        tags: ['Coupon'],
        description: 'Get coupon details by code (Admin only)',
        params: {
          type: 'object',
          required: ['code'],
          properties: {
            code: { type: 'string' },
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
    couponController.getCouponByCode
  );

  /**
   * @route PUT /api/v1/coupons/:code
   * @desc Update coupon (Admin only)
   * @access Admin
   */
  fastify.put(
    '/:code',
    {
      preHandler: [roleMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]), zodValidationMiddleware(updateCouponSchema)],
      schema: {
        tags: ['Coupon'],
        description: 'Update coupon details (Admin only)',
        params: {
          type: 'object',
          required: ['code'],
          properties: {
            code: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            usageLimit: { type: 'number', minimum: 1 },
            expiresAt: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
            description: { type: 'string' },
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
    couponController.updateCoupon
  );

  /**
   * @route DELETE /api/v1/coupons/:code
   * @desc Delete coupon (Admin only)
   * @access Admin
   */
  fastify.delete(
    '/:code',
    {
      preHandler: roleMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]),
      schema: {
        tags: ['Coupon'],
        description: 'Delete a coupon (Admin only)',
        params: {
          type: 'object',
          required: ['code'],
          properties: {
            code: { type: 'string' },
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
    couponController.deleteCoupon
  );

  /**
   * @route GET /api/v1/coupons/:code/stats
   * @desc Get coupon usage statistics (Admin only)
   * @access Admin
   */
  fastify.get(
    '/:code/stats',
    {
      preHandler: roleMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]),
      schema: {
        tags: ['Coupon'],
        description: 'Get coupon usage statistics (Admin only)',
        params: {
          type: 'object',
          required: ['code'],
          properties: {
            code: { type: 'string' },
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
                  coupon: { type: 'object' },
                  stats: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    couponController.getCouponStats
  );
}
