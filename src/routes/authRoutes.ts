import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/zodValidator';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from '../validators/authValidator';

export async function authRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post('/register', {
    preHandler: [validateBody(registerSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Register a new user',
    },
    handler: authController.register.bind(authController),
  });

  fastify.post('/login', {
    preHandler: [validateBody(loginSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Login user',
    },
    handler: authController.login.bind(authController),
  });

  fastify.post('/refresh-token', {
    preHandler: [validateBody(refreshTokenSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Refresh access token',
    },
    handler: authController.refreshToken.bind(authController),
  });

  fastify.post('/verify-email', {
    preHandler: [validateBody(verifyEmailSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Verify email address',
    },
    handler: authController.verifyEmail.bind(authController),
  });

  fastify.post('/forgot-password', {
    preHandler: [validateBody(forgotPasswordSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Request password reset',
    },
    handler: authController.forgotPassword.bind(authController),
  });

  fastify.post('/reset-password', {
    preHandler: [validateBody(resetPasswordSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Reset password with token',
    },
    handler: authController.resetPassword.bind(authController),
  });

  // Protected routes
  fastify.post('/logout', {
    preHandler: [authenticate],
    schema: {
      tags: ['Authentication'],
      description: 'Logout user',
    },
    handler: authController.logout.bind(authController),
  });

  fastify.post('/change-password', {
    preHandler: [authenticate, validateBody(changePasswordSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Change password',
    },
    handler: authController.changePassword.bind(authController) as any,
  });

  fastify.get('/profile', {
    preHandler: [authenticate],
    schema: {
      tags: ['Authentication'],
      description: 'Get current user profile',
    },
    handler: authController.getProfile.bind(authController) as any,
  });
}
