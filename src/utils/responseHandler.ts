import { FastifyReply } from 'fastify';
import { HTTP_STATUS } from '../constants/errorCodes';

interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ErrorResponse {
  success: false;
  message: string;
  errorCode?: number;
  details?: any;
  stack?: string;
}

export class ResponseHandler {
  static success<T>(
    reply: FastifyReply,
    message: string,
    data?: T,
    statusCode = HTTP_STATUS.OK
  ): FastifyReply {
    const response: SuccessResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
    };

    return reply.status(statusCode).send(response);
  }

  static created<T>(reply: FastifyReply, message: string, data?: T): FastifyReply {
    return this.success(reply, message, data, HTTP_STATUS.CREATED);
  }

  static paginated<T>(
    reply: FastifyReply,
    message: string,
    data: T[],
    meta: {
      page: number;
      limit: number;
      total: number;
    }
  ): FastifyReply {
    const totalPages = Math.ceil(meta.total / meta.limit);

    const response: SuccessResponse<T[]> = {
      success: true,
      message,
      data,
      meta: {
        ...meta,
        totalPages,
      },
    };

    return reply.status(HTTP_STATUS.OK).send(response);
  }

  static error(
    reply: FastifyReply,
    message: string,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode?: number,
    details?: any,
    stack?: string
  ): FastifyReply {
    const response: ErrorResponse = {
      success: false,
      message,
      ...(errorCode && { errorCode }),
      ...(details && { details }),
      ...(stack && process.env.NODE_ENV === 'development' && { stack }),
    };

    return reply.status(statusCode).send(response);
  }

  static noContent(reply: FastifyReply): FastifyReply {
    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
