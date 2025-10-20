import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { env } from './config/env';
import { errorHandlerPlugin } from './plugins/errorHandler';
import { swaggerPlugin } from './plugins/swagger';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { checkDatabaseConnection } from './config/database';
import { checkRedisConnection } from './config/redis';

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    cache: 10000,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE,
    },
  });

  // Register error handler
  await fastify.register(errorHandlerPlugin);

  // Register Swagger documentation
  if (env.NODE_ENV === 'development') {
    await fastify.register(swaggerPlugin);
  }

  // Health check route
  fastify.get('/health', async (request, reply) => {
    const dbHealthy = await checkDatabaseConnection();
    const redisHealthy = await checkRedisConnection();

    const status = dbHealthy && redisHealthy ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down',
      },
    };
  });

  // Register API routes
  const apiPrefix = `/api/${env.API_VERSION}`;

  await fastify.register(authRoutes, { prefix: `${apiPrefix}/auth` });
  await fastify.register(userRoutes, { prefix: `${apiPrefix}/users` });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      message: 'Route not found',
      path: request.url,
    });
  });

  return fastify;
}
