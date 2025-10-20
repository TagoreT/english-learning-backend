import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { ResponseHandler } from '../utils/responseHandler';
import { HTTP_STATUS, ErrorCode } from '../constants/errorCodes';
import { ERROR_MESSAGES } from '../constants/messages';

export async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    async (error: FastifyError | AppError | Error, _request: FastifyRequest, reply: FastifyReply) => {
      // Log error
      fastify.log.error(error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return ResponseHandler.error(
          reply,
          ERROR_MESSAGES.VALIDATION_ERROR,
          HTTP_STATUS.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          error.errors
        );
      }

      // Handle custom AppError
      if (error instanceof AppError) {
        return ResponseHandler.error(
          reply,
          error.message,
          error.statusCode,
          error.errorCode,
          undefined,
          error.stack
        );
      }

      // Handle Fastify validation errors
      if ((error as FastifyError).validation) {
        return ResponseHandler.error(
          reply,
          ERROR_MESSAGES.VALIDATION_ERROR,
          HTTP_STATUS.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          (error as FastifyError).validation
        );
      }

      // Handle Prisma errors
      if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error as any;
        if (prismaError.code === 'P2002') {
          return ResponseHandler.error(
            reply,
            'A record with this value already exists',
            HTTP_STATUS.CONFLICT,
            ErrorCode.VALIDATION_ERROR
          );
        }
        if (prismaError.code === 'P2025') {
          return ResponseHandler.error(
            reply,
            ERROR_MESSAGES.RESOURCE_NOT_FOUND,
            HTTP_STATUS.NOT_FOUND,
            ErrorCode.RESOURCE_NOT_FOUND
          );
        }
      }

      // Default error response
      return ResponseHandler.error(
        reply,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
        undefined,
        error.stack
      );
    }
  );
}
