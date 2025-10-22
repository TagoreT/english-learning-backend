import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { instructorController } from '../controllers/instructorController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';
import { zodValidationMiddleware } from '../middlewares/zodValidation';
import {
  applyInstructorSchema,
  updateInstructorSchema,
  approveInstructorSchema,
} from '../validators/instructorValidator';
import { UserRole } from '@prisma/client';

export async function instructorRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Apply auth middleware to all routes
  fastify.addHook('onRequest', authMiddleware);

  /**
   * @route POST /api/v1/instructors/apply
   * @desc Apply to become an instructor
   * @access Private (USER)
   */
  fastify.post(
    '/apply',
    {
      preHandler: zodValidationMiddleware(applyInstructorSchema),
      schema: {
        tags: ['Instructor'],
        description: 'Apply to become an instructor',
        body: {
          type: 'object',
          required: ['bio', 'expertise', 'experience', 'qualification'],
          properties: {
            bio: { type: 'string', minLength: 50, maxLength: 1000 },
            expertise: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 10 },
            experience: { type: 'number', minimum: 0 },
            qualification: { type: 'string', minLength: 10 },
            socialLinks: { type: 'object' },
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
    instructorController.applyToBeInstructor
  );

  /**
   * @route GET /api/v1/instructors/:id/profile
   * @desc Get instructor profile
   * @access Private
   */
  fastify.get(
    '/:id/profile',
    {
      schema: {
        tags: ['Instructor'],
        description: 'Get instructor profile by ID',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
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
    instructorController.getInstructorProfile
  );

  /**
   * @route GET /api/v1/instructors/:id/courses
   * @desc Get instructor's courses
   * @access Private
   */
  fastify.get(
    '/:id/courses',
    {
      schema: {
        tags: ['Instructor'],
        description: 'Get all courses by an instructor',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
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
                  courses: { type: 'array' },
                  totalCourses: { type: 'number' },
                  publishedCourses: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    instructorController.getInstructorCourses
  );

  /**
   * @route GET /api/v1/instructors/earnings
   * @desc Get instructor's earnings
   * @access Private (INSTRUCTOR)
   */
  fastify.get(
    '/earnings',
    {
      preHandler: roleMiddleware([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN]),
      schema: {
        tags: ['Instructor'],
        description: 'Get instructor earnings and statistics',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  totalEarnings: { type: 'number' },
                  platformCommission: { type: 'number' },
                  netEarnings: { type: 'number' },
                  totalEnrollments: { type: 'number' },
                  courseBreakdown: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    instructorController.getInstructorEarnings
  );

  /**
   * @route PUT /api/v1/instructors/profile
   * @desc Update instructor profile
   * @access Private (INSTRUCTOR)
   */
  fastify.put(
    '/profile',
    {
      preHandler: [
        roleMiddleware([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN]),
        zodValidationMiddleware(updateInstructorSchema),
      ],
      schema: {
        tags: ['Instructor'],
        description: 'Update instructor profile',
        body: {
          type: 'object',
          properties: {
            bio: { type: 'string', minLength: 50, maxLength: 1000 },
            expertise: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 10 },
            socialLinks: { type: 'object' },
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
    instructorController.updateInstructorProfile
  );

  /**
   * @route POST /api/v1/instructors/:id/approve
   * @desc Approve or reject instructor application
   * @access Admin
   */
  fastify.post(
    '/:id/approve',
    {
      preHandler: [
        roleMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]),
        zodValidationMiddleware(approveInstructorSchema),
      ],
      schema: {
        tags: ['Instructor'],
        description: 'Approve or reject instructor application (Admin only)',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['approved'],
          properties: {
            approved: { type: 'boolean' },
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
    instructorController.approveInstructor
  );

  /**
   * @route GET /api/v1/instructors/applications
   * @desc Get all instructor applications
   * @access Admin
   */
  fastify.get(
    '/applications',
    {
      preHandler: roleMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]),
      schema: {
        tags: ['Instructor'],
        description: 'Get all instructor applications (Admin only)',
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['pending', 'approved', 'all'], default: 'all' },
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
                  instructors: { type: 'array' },
                  total: { type: 'number' },
                  pending: { type: 'number' },
                  approved: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    instructorController.getAllInstructorApplications
  );
}
