import { FastifyInstance } from 'fastify';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/role';
import { zodValidationMiddleware, validateQuery } from '../middlewares/zodValidation';
import { updateProfileSchema, updateAvatarSchema, getUsersQuerySchema } from '../validators/userValidator';

export async function userRoutes(fastify: FastifyInstance) {
  // All user routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // User profile routes
  fastify.put('/profile', {
    preHandler: [zodValidationMiddleware(updateProfileSchema)],
    schema: {
      tags: ['Users'],
      description: 'Update user profile',
    },
  }, userController.updateProfile);

  fastify.put('/avatar', {
    preHandler: [zodValidationMiddleware(updateAvatarSchema)],
    schema: {
      tags: ['Users'],
      description: 'Update user avatar',
    },
  }, userController.updateAvatar);

  // Wallet routes
  fastify.get('/wallet', {
    schema: {
      tags: ['Users'],
      description: 'Get wallet balance',
    },
  }, userController.getWalletBalance);

  fastify.get('/transactions', {
    schema: {
      tags: ['Users'],
      description: 'Get user transactions',
    },
  }, userController.getTransactions);

  // Stats
  fastify.get('/stats', {
    schema: {
      tags: ['Users'],
      description: 'Get user statistics',
    },
  }, userController.getUserStats);

  // Admin routes
  fastify.get('/all', {
    preHandler: [requireAdmin, validateQuery(getUsersQuerySchema)],
    schema: {
      tags: ['Users', 'Admin'],
      description: 'Get all users (Admin only)',
    },
  }, userController.getAllUsers);

  fastify.delete('/:userId', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Users', 'Admin'],
      description: 'Delete user (Admin only)',
    },
  }, userController.deleteUser);
}
