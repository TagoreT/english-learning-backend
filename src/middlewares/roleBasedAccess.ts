import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthorizationError } from '../utils/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { UserRole, hasPermission, PERMISSIONS } from '../constants/roles';

/**
 * Role-based access control middleware
 * Checks if user has the required role
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new AuthorizationError(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const userRole = request.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
  };
};

/**
 * Check if user has minimum required role (hierarchical)
 */
export const requireMinimumRole = (minimumRole: UserRole) => {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new AuthorizationError(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const userRole = request.user.role as UserRole;

    if (!hasPermission(userRole, minimumRole)) {
      throw new AuthorizationError(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
    }
  };
};

/**
 * Check if user has specific permission
 */
export const requirePermission = (permission: keyof typeof PERMISSIONS) => {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new AuthorizationError(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const userRole = request.user.role as UserRole;
    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles.includes(userRole)) {
      throw new AuthorizationError(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
    }
  };
};

/**
 * Check if user is accessing their own resource
 */
export const requireOwnership = (userIdField = 'userId') => {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new AuthorizationError(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const resourceUserId = (request.params as any)[userIdField] || (request.body as any)[userIdField];

    // Admins can access any resource
    const userRole = request.user.role as UserRole;
    if (userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN) {
      return;
    }

    // Check ownership
    if (resourceUserId !== request.user.userId) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
  };
};

/**
 * Middleware to check if user is an instructor
 */
export const requireInstructor = async (request: FastifyRequest, _reply: FastifyReply) => {
  if (!request.user) {
    throw new AuthorizationError(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const userRole = request.user.role as UserRole;

  if (userRole !== UserRole.INSTRUCTOR && userRole !== UserRole.ADMIN && userRole !== UserRole.SUPERADMIN) {
    throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
  }
};

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = async (request: FastifyRequest, _reply: FastifyReply) => {
  if (!request.user) {
    throw new AuthorizationError(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const userRole = request.user.role as UserRole;

  if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPERADMIN) {
    throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
  }
};

/**
 * Middleware to check if user is a superadmin
 */
export const requireSuperAdmin = async (request: FastifyRequest, _reply: FastifyReply) => {
  if (!request.user) {
    throw new AuthorizationError(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const userRole = request.user.role as UserRole;

  if (userRole !== UserRole.SUPERADMIN) {
    throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
  }
};
