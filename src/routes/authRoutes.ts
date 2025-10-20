import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
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
    schema: {
      body: registerSchema,
      tags: ['Authentication'],
      description: 'Register a new user',
    },
    handler: authController.register.bind(authController),
  });

  fastify.post('/login', {
    schema: {
      body: loginSchema,
      tags: ['Authentication'],
      description: 'Login user',
    },
    handler: authController.login.bind(authController),
  });

  fastify.post('/refresh-token', {
    schema: {
      body: refreshTokenSchema,
      tags: ['Authentication'],
      description: 'Refresh access token',
    },
    handler: authController.refreshToken.bind(authController),
  });

  fastify.post('/verify-email', {
    schema: {
      body: verifyEmailSchema,
      tags: ['Authentication'],
      description: 'Verify email address',
    },
    handler: authController.verifyEmail.bind(authController),
  });

  fastify.post('/forgot-password', {
    schema: {
      body: forgotPasswordSchema,
      tags: ['Authentication'],
      description: 'Request password reset',
    },
    handler: authController.forgotPassword.bind(authController),
  });

  fastify.post('/reset-password', {
    schema: {
      body: resetPasswordSchema,
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
    preHandler: [authenticate],
    schema: {
      body: changePasswordSchema,
      tags: ['Authentication'],
      description: 'Change password',
    },
    handler: authController.changePassword.bind(authController),
  });

  fastify.get('/profile', {
    preHandler: [authenticate],
    schema: {
      tags: ['Authentication'],
      description: 'Get current user profile',
    },
    handler: authController.getProfile.bind(authController),
  });
}
