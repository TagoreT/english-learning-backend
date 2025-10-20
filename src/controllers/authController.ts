import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/authService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ChangePasswordInput,
} from '../validators/authValidator';

export class AuthController {
  async register(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply
  ) {
    const { user, tokens } = await authService.register(request.body);
    return ResponseHandler.created(reply, SUCCESS_MESSAGES.REGISTER_SUCCESS, {
      user,
      tokens,
    });
  }

  async login(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
  ) {
    const { email, password } = request.body;
    const { user, tokens } = await authService.login(email, password);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
      user,
      tokens,
    });
  }

  async refreshToken(
    request: FastifyRequest<{ Body: RefreshTokenInput }>,
    reply: FastifyReply
  ) {
    const { refreshToken } = request.body;
    const tokens = await authService.refreshToken(refreshToken);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.TOKEN_REFRESHED, tokens);
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.substring(7) || '';
    await authService.logout(token);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
  }

  async verifyEmail(
    request: FastifyRequest<{ Body: VerifyEmailInput }>,
    reply: FastifyReply
  ) {
    const { token } = request.body;
    await authService.verifyEmail(token);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.EMAIL_VERIFIED);
  }

  async forgotPassword(
    request: FastifyRequest<{ Body: ForgotPasswordInput }>,
    reply: FastifyReply
  ) {
    const { email } = request.body;
    await authService.forgotPassword(email);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.PASSWORD_RESET_SENT);
  }

  async resetPassword(
    request: FastifyRequest<{ Body: ResetPasswordInput }>,
    reply: FastifyReply
  ) {
    const { token, newPassword } = request.body;
    await authService.resetPassword(token, newPassword);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS);
  }

  async changePassword(
    request: FastifyRequest<{ Body: ChangePasswordInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const { currentPassword, newPassword } = request.body;
    await authService.changePassword(userId, currentPassword, newPassword);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS);
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { userService } = await import('../services/userService');
    const user = await userService.getUserById(userId);
    return ResponseHandler.success(reply, 'Profile retrieved successfully', user);
  }
}

export const authController = new AuthController();
