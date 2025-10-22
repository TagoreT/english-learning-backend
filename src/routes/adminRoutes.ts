import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { adminController } from '../controllers/adminController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';
import { zodValidationMiddleware } from '../middlewares/zodValidation';
import {
  updateUserRoleSchema,
  generateReportSchema,
  processWithdrawalSchema,
} from '../validators/adminValidator';
import { UserRole } from '@prisma/client';

export async function adminRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Apply auth middleware and admin role check to all routes
  fastify.addHook('onRequest', authMiddleware);
  fastify.addHook('onRequest', roleMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]));

  /**
   * @route GET /api/v1/admin/dashboard/stats
   * @desc Get dashboard statistics
   * @access Admin
   */
  fastify.get(
    '/dashboard/stats',
    {
      schema: {
        tags: ['Admin'],
        description: 'Get admin dashboard statistics',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  overview: { type: 'object' },
                  revenueByType: { type: 'array' },
                  recentTransactions: { type: 'array' },
                },
              },
            },
          },
        },
      },
    },
    adminController.getDashboardStats
  );

  /**
   * @route GET /api/v1/admin/transactions
   * @desc Get all transactions with filters
   * @access Admin
   */
  fastify.get(
    '/transactions',
    {
      schema: {
        tags: ['Admin'],
        description: 'Get all transactions with pagination and filters',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', default: '1' },
            limit: { type: 'string', default: '20' },
            type: { type: 'string' },
            status: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
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
    adminController.getAllTransactions
  );

  /**
   * @route PUT /api/v1/admin/users/:userId/role
   * @desc Update user role
   * @access Admin
   */
  fastify.put(
    '/users/:userId/role',
    {
      preHandler: zodValidationMiddleware(updateUserRoleSchema),
      schema: {
        tags: ['Admin'],
        description: 'Update user role (Admin only)',
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['role'],
          properties: {
            role: {
              type: 'string',
              enum: ['USER', 'INSTRUCTOR', 'ADMIN', 'SUPERADMIN'],
            },
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
    adminController.updateUserRole
  );

  /**
   * @route POST /api/v1/admin/reports/generate
   * @desc Generate report
   * @access Admin
   */
  fastify.post(
    '/reports/generate',
    {
      preHandler: zodValidationMiddleware(generateReportSchema),
      schema: {
        tags: ['Admin'],
        description: 'Generate various reports (Admin only)',
        body: {
          type: 'object',
          required: ['reportType'],
          properties: {
            reportType: {
              type: 'string',
              enum: ['USERS', 'COURSES', 'REVENUE', 'SUBSCRIPTIONS', 'TRANSACTIONS'],
            },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            format: { type: 'string', enum: ['JSON', 'CSV', 'PDF'], default: 'JSON' },
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
                  reportType: { type: 'string' },
                  generatedAt: { type: 'string' },
                  dateRange: { type: 'object' },
                  data: { type: 'array' },
                  totalRecords: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    adminController.generateReport
  );

  /**
   * @route GET /api/v1/admin/withdrawals/pending
   * @desc Get pending withdrawals
   * @access Admin
   */
  fastify.get(
    '/withdrawals/pending',
    {
      schema: {
        tags: ['Admin'],
        description: 'Get all pending withdrawal requests',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  withdrawals: { type: 'array' },
                  count: { type: 'number' },
                  totalAmount: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    adminController.getPendingWithdrawals
  );

  /**
   * @route POST /api/v1/admin/withdrawals/:withdrawalId/process
   * @desc Process withdrawal request
   * @access Admin
   */
  fastify.post(
    '/withdrawals/:withdrawalId/process',
    {
      preHandler: zodValidationMiddleware(processWithdrawalSchema),
      schema: {
        tags: ['Admin'],
        description: 'Approve or reject withdrawal request',
        params: {
          type: 'object',
          required: ['withdrawalId'],
          properties: {
            withdrawalId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
            notes: { type: 'string', maxLength: 500 },
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
    adminController.processWithdrawal
  );

  /**
   * @route GET /api/v1/admin/system/health
   * @desc Get system health metrics
   * @access Admin
   */
  fastify.get(
    '/system/health',
    {
      schema: {
        tags: ['Admin'],
        description: 'Get system health and performance metrics',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  database: { type: 'object' },
                  auditLogs: { type: 'object' },
                  errors: { type: 'object' },
                  uptime: { type: 'number' },
                  memory: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    adminController.getSystemHealth
  );
}
