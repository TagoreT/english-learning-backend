import { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { env } from '../config/env';

export async function swaggerPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'English Learning Platform API',
        description: 'Complete backend API for English Learning Platform',
        version: '1.0.0',
      },
      servers: [
        {
          url: env.BACKEND_URL,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
      tags: [
        { name: 'Authentication', description: 'Authentication endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Courses', description: 'Course management endpoints' },
        { name: 'Quizzes', description: 'Quiz management endpoints' },
        { name: 'Subscriptions', description: 'Subscription management endpoints' },
        { name: 'Payments', description: 'Payment and wallet endpoints' },
        { name: 'Admin', description: 'Admin endpoints' },
      ],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
}
