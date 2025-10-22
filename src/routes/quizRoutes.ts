import { FastifyInstance } from 'fastify';
import { quizController } from '../controllers/quizController';
import { authMiddleware } from '../middlewares/auth';
import { requireInstructor, requireAdmin } from '../middlewares/role';
import { zodValidationMiddleware, validateQuery } from '../middlewares/zodValidation';
import {
  createQuizSchema,
  getQuizzesQuerySchema,
  submitQuizSchema,
} from '../validators/quizValidator';

export async function quizRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.get('/', {
    preHandler: [validateQuery(getQuizzesQuerySchema)],
    schema: {
      tags: ['Quizzes'],
      description: 'Get all quizzes with filters',
    },
  }, quizController.getAllQuizzes);

  fastify.get('/:quizId', {
    schema: {
      tags: ['Quizzes'],
      description: 'Get quiz by ID',
    },
  }, quizController.getQuizById);

  // Protected routes
  fastify.post('/:quizId/attempt', {
    preHandler: [authMiddleware, zodValidationMiddleware(submitQuizSchema)],
    schema: {
      tags: ['Quizzes'],
      description: 'Submit quiz attempt',
    },
  }, quizController.submitQuizAttempt);

  fastify.get('/:quizId/attempts', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Quizzes'],
      description: 'Get user quiz attempts',
    },
  }, quizController.getQuizAttempts);

  // Instructor/Admin only routes
  fastify.post('/', {
    preHandler: [authMiddleware, requireInstructor, zodValidationMiddleware(createQuizSchema)],
    schema: {
      tags: ['Quizzes', 'Instructor'],
      description: 'Create a new quiz',
    },
  }, quizController.createQuiz);
}
