import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtHelper } from '../utils/jwtHelper';
import { AuthenticationError } from '../utils/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { ErrorCode } from '../constants/errorCodes';
import { prisma } from '../config/database';
import { cacheGet, cacheSet } from '../config/redis';

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}

/**
 * Authentication middleware to verify JWT token
 */
export const authenticate = async (request: FastifyRequest, _reply: FastifyReply) => {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError(ERROR_MESSAGES.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = JwtHelper.verifyAccessToken(token);

    // Check if token is blacklisted (for logout)
    const isBlacklisted = await cacheGet(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AuthenticationError(ERROR_MESSAGES.TOKEN_INVALID, ErrorCode.TOKEN_INVALID);
    }

    // Try to get user from cache first
    const cacheKey = `user:${payload.userId}`;
    let userJson = await cacheGet(cacheKey);

    if (!userJson) {
      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isVerified: true,
        },
      });

      if (!user) {
        throw new AuthenticationError(ERROR_MESSAGES.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND);
      }

      // Cache user data for 5 minutes
      userJson = JSON.stringify(user);
      await cacheSet(cacheKey, userJson, 300);
    }

    const user = JSON.parse(userJson);

    // Attach user to request
    request.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError(ERROR_MESSAGES.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuthenticate = async (request: FastifyRequest, _reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      await authenticate(request, _reply);
    }
  } catch (error) {
    // Silently fail for optional auth
  }
};

/**
 * Middleware to check if email is verified
 */
export const requireEmailVerification = async (request: FastifyRequest, _reply: FastifyReply) => {
  if (!request.user) {
    throw new AuthenticationError(ERROR_MESSAGES.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
  }

  const user = await prisma.user.findUnique({
    where: { id: request.user.userId },
    select: { isVerified: true },
  });

  if (!user?.isVerified) {
    throw new AuthenticationError(
      ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
      ErrorCode.EMAIL_NOT_VERIFIED
    );
  }
};
