import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { topicController } from '../controllers/topicController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';
import { zodValidationMiddleware } from '../middlewares/zodValidation';
import { createTopicSchema, updateTopicSchema } from '../validators/topicValidator';
import { UserRole } from '@prisma/client';

export async function topicRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Apply auth middleware to all routes
  fastify.addHook('onRequest', authMiddleware);

  /**
   * @route GET /api/v1/topics
   * @desc Get all topics with filters
   * @access Private
   */
  fastify.get(
    '/',
    {
      schema: {
        tags: ['Topic'],
        description: 'Get all topics with optional filters',
        querystring: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            difficulty: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
            isPublic: { type: 'string', enum: ['true', 'false'] },
            search: { type: 'string' },
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
                  topics: { type: 'array' },
                },
              },
            },
          },
        },
      },
    },
    topicController.getAllTopics
  );

  /**
   * @route GET /api/v1/topics/categories
   * @desc Get all topic categories
   * @access Private
   */
  fastify.get(
    '/categories',
    {
      schema: {
        tags: ['Topic'],
        description: 'Get all available topic categories',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  categories: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    topicController.getCategories
  );

  /**
   * @route GET /api/v1/topics/pending
   * @desc Get pending topic suggestions (Admin only)
   * @access Admin
   */
  fastify.get(
    '/pending',
    {
      preHandler: roleMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]),
      schema: {
        tags: ['Topic'],
        description: 'Get all pending topic suggestions (Admin only)',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  topics: { type: 'array' },
                  count: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    topicController.getPendingTopics
  );

  /**
   * @route GET /api/v1/topics/:id
   * @desc Get topic by ID
   * @access Private
   */
  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['Topic'],
        description: 'Get topic details by ID',
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
    topicController.getTopicById
  );

  /**
   * @route POST /api/v1/topics
   * @desc Create a new topic (or suggest topic if not admin)
   * @access Private
   */
  fastify.post(
    '/',
    {
      preHandler: zodValidationMiddleware(createTopicSchema),
      schema: {
        tags: ['Topic'],
        description: 'Create a new topic (Admin) or suggest a topic (User)',
        body: {
          type: 'object',
          required: ['title', 'category'],
          properties: {
            title: { type: 'string', minLength: 3, maxLength: 200 },
            category: { type: 'string', minLength: 2 },
            description: { type: 'string', maxLength: 1000 },
            difficulty: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
            tags: { type: 'array', items: { type: 'string' } },
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
    topicController.createTopic
  );

  /**
   * @route PUT /api/v1/topics/:id
   * @desc Update topic (Admin or creator)
   * @access Private
   */
  fastify.put(
    '/:id',
    {
      preHandler: zodValidationMiddleware(updateTopicSchema),
      schema: {
        tags: ['Topic'],
        description: 'Update topic (Admin or topic creator)',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 3, maxLength: 200 },
            category: { type: 'string', minLength: 2 },
            description: { type: 'string', maxLength: 1000 },
            difficulty: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
            tags: { type: 'array', items: { type: 'string' } },
            isPublic: { type: 'boolean' },
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
    topicController.updateTopic
  );

  /**
   * @route DELETE /api/v1/topics/:id
   * @desc Delete topic (Admin or creator)
   * @access Private
   */
  fastify.delete(
    '/:id',
    {
      schema: {
        tags: ['Topic'],
        description: 'Delete topic (Admin or topic creator)',
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
    topicController.deleteTopic
  );
}
