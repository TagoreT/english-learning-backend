import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';
import { zodValidationMiddleware } from '../middlewares/zodValidation';
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
    preHandler: [zodValidationMiddleware(registerSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Register a new user',
    },
  }, authController.register);

  fastify.post('/login', {
    preHandler: [zodValidationMiddleware(loginSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Login user',
    },
  }, authController.login);

  fastify.post('/refresh-token', {
    preHandler: [zodValidationMiddleware(refreshTokenSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Refresh access token',
    },
  }, authController.refreshToken);

  fastify.post('/verify-email', {
    preHandler: [zodValidationMiddleware(verifyEmailSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Verify email address',
    },
  }, authController.verifyEmail);

  fastify.post('/forgot-password', {
    preHandler: [zodValidationMiddleware(forgotPasswordSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Request password reset',
    },
  }, authController.forgotPassword);

  fastify.post('/reset-password', {
    preHandler: [zodValidationMiddleware(resetPasswordSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Reset password with token',
    },
  }, authController.resetPassword);

  // Protected routes
  fastify.post('/logout', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Authentication'],
      description: 'Logout user',
    },
  }, authController.logout);

  fastify.post('/change-password', {
    preHandler: [authMiddleware, zodValidationMiddleware(changePasswordSchema)],
    schema: {
      tags: ['Authentication'],
      description: 'Change password',
    },
  }, authController.changePassword);

  fastify.get('/profile', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Authentication'],
      description: 'Get current user profile',
    },
  }, authController.getProfile);
}
