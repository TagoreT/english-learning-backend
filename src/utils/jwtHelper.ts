import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticationError } from './errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { ErrorCode } from '../constants/errorCodes';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtHelper {
  private static readonly ACCESS_TOKEN_SECRET = env.JWT_SECRET;
  private static readonly REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET;
  private static readonly ACCESS_TOKEN_EXPIRES_IN = env.JWT_ACCESS_EXPIRES_IN;
  private static readonly REFRESH_TOKEN_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;

  /**
   * Generate access token
   */
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: JwtPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError(ERROR_MESSAGES.TOKEN_EXPIRED, ErrorCode.TOKEN_EXPIRED);
      }
      throw new AuthenticationError(ERROR_MESSAGES.TOKEN_INVALID, ErrorCode.TOKEN_INVALID);
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError(ERROR_MESSAGES.TOKEN_EXPIRED, ErrorCode.TOKEN_EXPIRED);
      }
      throw new AuthenticationError(ERROR_MESSAGES.TOKEN_INVALID, ErrorCode.TOKEN_INVALID);
    }
  }

  /**
   * Decode token without verification (use carefully)
   */
  static decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): number | null {
    const decoded = this.decode(token);
    return decoded && (decoded as any).exp ? (decoded as any).exp : null;
  }
}
