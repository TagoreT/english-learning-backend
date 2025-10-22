import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { uploadController } from '../controllers/uploadController';
import { authMiddleware } from '../middlewares/auth';

export async function uploadRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Apply auth middleware to all routes
  fastify.addHook('onRequest', authMiddleware);

  /**
   * @route POST /api/v1/upload/file
   * @desc Upload a file to S3/storage
   * @access Private
   */
  fastify.post(
    '/file',
    {
      schema: {
        tags: ['Upload'],
        description: 'Upload a file to cloud storage',
        consumes: ['multipart/form-data'],
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  fileUrl: { type: 'string' },
                  fileName: { type: 'string' },
                  mimeType: { type: 'string' },
                  size: { type: 'number' },
                  folder: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    uploadController.uploadFile
  );

  /**
   * @route POST /api/v1/upload/avatar
   * @desc Upload user avatar
   * @access Private
   */
  fastify.post(
    '/avatar',
    {
      schema: {
        tags: ['Upload'],
        description: 'Upload user avatar image',
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  avatarUrl: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    uploadController.uploadAvatar
  );

  /**
   * @route POST /api/v1/upload/audio
   * @desc Upload audio file for pronunciation assessment
   * @access Private
   */
  fastify.post(
    '/audio',
    {
      schema: {
        tags: ['Upload'],
        description: 'Upload audio file for pronunciation assessment',
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  audioUrl: { type: 'string' },
                  fileName: { type: 'string' },
                  mimeType: { type: 'string' },
                  size: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    uploadController.uploadAudio
  );

  /**
   * @route DELETE /api/v1/upload/file/:fileKey
   * @desc Delete a file from S3/storage
   * @access Private
   */
  fastify.delete(
    '/file/:fileKey',
    {
      schema: {
        tags: ['Upload'],
        description: 'Delete a file from cloud storage',
        params: {
          type: 'object',
          required: ['fileKey'],
          properties: {
            fileKey: { type: 'string' },
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
                  fileKey: { type: 'string' },
                  deleted: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    uploadController.deleteFile
  );

  /**
   * @route GET /api/v1/upload/signed-url/:fileKey
   * @desc Get a signed URL for private file access
   * @access Private
   */
  fastify.get(
    '/signed-url/:fileKey',
    {
      schema: {
        tags: ['Upload'],
        description: 'Get a signed URL for accessing a private file',
        params: {
          type: 'object',
          required: ['fileKey'],
          properties: {
            fileKey: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            expiresIn: { type: 'string', default: '3600' },
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
                  signedUrl: { type: 'string' },
                  expiresIn: { type: 'number' },
                  expiresAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    uploadController.getSignedUrl
  );
}
