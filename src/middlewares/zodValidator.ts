import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export function validateBody(schema: ZodSchema) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.errors);
    }
    // Replace body with parsed data
    request.body = result.data;
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.errors);
    }
    request.query = result.data as any;
  };
}

export function validateParams(schema: ZodSchema) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.errors);
    }
    request.params = result.data as any;
  };
}
