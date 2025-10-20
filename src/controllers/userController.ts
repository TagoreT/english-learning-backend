import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/userService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';
import { UpdateProfileInput, UpdateAvatarInput, GetUsersQuery } from '../validators/userValidator';

export class UserController {
  async updateProfile(
    request: FastifyRequest<{ Body: UpdateProfileInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const user = await userService.updateProfile(userId, request.body);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.PROFILE_UPDATED, user);
  }

  async updateAvatar(
    request: FastifyRequest<{ Body: UpdateAvatarInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const user = await userService.updateAvatar(userId, request.body.avatarUrl);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.PROFILE_UPDATED, user);
  }

  async getWalletBalance(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const wallet = await userService.getWalletBalance(userId);
    return ResponseHandler.success(reply, 'Wallet balance retrieved', wallet);
  }

  async getTransactions(
    request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const { page, limit } = request.query;
    const result = await userService.getTransactions(userId, page, limit);
    return ResponseHandler.paginated(
      reply,
      'Transactions retrieved',
      result.transactions,
      {
        page: page || 1,
        limit: limit || 10,
        total: result.total,
      }
    );
  }

  async getUserStats(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const stats = await userService.getUserStats(userId);
    return ResponseHandler.success(reply, 'User stats retrieved', stats);
  }

  async getAllUsers(
    request: FastifyRequest<{ Querystring: GetUsersQuery }>,
    reply: FastifyReply
  ) {
    const result = await userService.getAllUsers(request.query);
    return ResponseHandler.paginated(
      reply,
      'Users retrieved',
      result.users,
      {
        page: request.query.page || 1,
        limit: request.query.limit || 10,
        total: result.total,
      }
    );
  }

  async deleteUser(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    await userService.deleteUser(request.params.userId);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.USER_DELETED);
  }
}

export const userController = new UserController();
