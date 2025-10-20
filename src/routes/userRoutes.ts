import { FastifyInstance } from 'fastify';
import { userController } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleBasedAccess';
import { validateBody, validateQuery } from '../middlewares/zodValidator';
import { updateProfileSchema, updateAvatarSchema, getUsersQuerySchema } from '../validators/userValidator';

export async function userRoutes(fastify: FastifyInstance) {
  // All user routes require authentication
  fastify.addHook('preHandler', authenticate);

  // User profile routes
  fastify.put('/profile', {
    preHandler: [validateBody(updateProfileSchema)],
    schema: {
      tags: ['Users'],
      description: 'Update user profile',
    },
    handler: userController.updateProfile.bind(userController),
  });

  fastify.put('/avatar', {
    preHandler: [validateBody(updateAvatarSchema)],
    schema: {
      tags: ['Users'],
      description: 'Update user avatar',
    },
    handler: userController.updateAvatar.bind(userController),
  });

  // Wallet routes
  fastify.get('/wallet', {
    schema: {
      tags: ['Users'],
      description: 'Get wallet balance',
    },
    handler: userController.getWalletBalance.bind(userController),
  });

  fastify.get('/transactions', {
    schema: {
      tags: ['Users'],
      description: 'Get user transactions',
    },
    handler: userController.getTransactions.bind(userController),
  });

  // Stats
  fastify.get('/stats', {
    schema: {
      tags: ['Users'],
      description: 'Get user statistics',
    },
    handler: userController.getUserStats.bind(userController),
  });

  // Admin routes
  fastify.get('/all', {
    preHandler: [requireAdmin, validateQuery(getUsersQuerySchema)],
    schema: {
      tags: ['Users', 'Admin'],
      description: 'Get all users (Admin only)',
    },
    handler: userController.getAllUsers.bind(userController) as any,
  });

  fastify.delete('/:userId', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Users', 'Admin'],
      description: 'Delete user (Admin only)',
    },
    handler: userController.deleteUser.bind(userController) as any,
  });
}
