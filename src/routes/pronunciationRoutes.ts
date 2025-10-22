import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { pronunciationController } from '../controllers/pronunciationController';
import { authMiddleware } from '../middlewares/auth';
import { zodValidationMiddleware } from '../middlewares/zodValidation';
import { assessPronunciationSchema } from '../validators/pronunciationValidator';

export async function pronunciationRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Apply auth middleware to all routes
  fastify.addHook('onRequest', authMiddleware);

  /**
   * @route POST /api/v1/pronunciation/assess
   * @desc Assess pronunciation from audio
   * @access Private
   */
  fastify.post(
    '/assess',
    {
      preHandler: zodValidationMiddleware(assessPronunciationSchema),
      schema: {
        tags: ['Pronunciation'],
        description: 'Assess pronunciation from uploaded audio file',
        body: {
          type: 'object',
          required: ['audioUrl', 'contentText'],
          properties: {
            audioUrl: { type: 'string', format: 'uri' },
            contentText: { type: 'string', minLength: 1, maxLength: 1000 },
            language: { type: 'string', default: 'en-US' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  pronunciation: { type: 'object' },
                  scores: {
                    type: 'object',
                    properties: {
                      accuracyScore: { type: 'number' },
                      fluencyScore: { type: 'number' },
                      completenessScore: { type: 'number' },
                      pronunciationScore: { type: 'number' },
                    },
                  },
                  feedback: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    pronunciationController.assessPronunciation
  );

  /**
   * @route GET /api/v1/pronunciation/history
   * @desc Get pronunciation assessment history
   * @access Private
   */
  fastify.get(
    '/history',
    {
      schema: {
        tags: ['Pronunciation'],
        description: 'Get pronunciation assessment history with pagination',
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
                  pronunciations: { type: 'array' },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'number' },
                      limit: { type: 'number' },
                      total: { type: 'number' },
                      totalPages: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    pronunciationController.getPronunciationHistory
  );

  /**
   * @route GET /api/v1/pronunciation/:id/feedback
   * @desc Get detailed feedback for a specific pronunciation assessment
   * @access Private
   */
  fastify.get(
    '/:id/feedback',
    {
      schema: {
        tags: ['Pronunciation'],
        description: 'Get detailed feedback for a pronunciation assessment',
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
                  id: { type: 'string' },
                  contentText: { type: 'string' },
                  audioUrl: { type: 'string' },
                  scores: { type: 'object' },
                  feedback: { type: 'object' },
                  createdAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    pronunciationController.getPronunciationFeedback
  );

  /**
   * @route GET /api/v1/pronunciation/stats
   * @desc Get pronunciation statistics
   * @access Private
   */
  fastify.get(
    '/stats',
    {
      schema: {
        tags: ['Pronunciation'],
        description: 'Get pronunciation assessment statistics',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  totalAssessments: { type: 'number' },
                  averageScore: { type: 'number' },
                  highestScore: { type: 'number' },
                  lowestScore: { type: 'number' },
                  recentProgress: { type: 'array' },
                },
              },
            },
          },
        },
      },
    },
    pronunciationController.getPronunciationStats
  );
}
