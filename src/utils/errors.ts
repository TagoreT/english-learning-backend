import { ErrorCode, HTTP_STATUS } from '../constants/errorCodes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, errorCode: ErrorCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly details?: any;

  constructor(message: string, details?: any) {
    super(message, HTTP_STATUS.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errorCode);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.FORBIDDEN, ErrorCode.FORBIDDEN);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND, errorCode);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, HTTP_STATUS.CONFLICT, errorCode);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class PaymentError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.PAYMENT_FAILED) {
    super(message, HTTP_STATUS.BAD_REQUEST, errorCode);
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, HTTP_STATUS.BAD_REQUEST, errorCode);
    Object.setPrototypeOf(this, FileUploadError.prototype);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, errorCode: ErrorCode, isOperational = true) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, errorCode, isOperational);
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ErrorCode.DATABASE_ERROR, false);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
