import { FastifyRequest, FastifyReply } from 'fastify';
import { referralService } from '../services/referralService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';

export class ReferralController {
  /**
   * Get user's referrals
   */
  async getMyReferrals(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const result = await referralService.getMyReferrals(userId);
    return ResponseHandler.success(reply, 'Referrals fetched successfully', result);
  }

  /**
   * Get referral statistics
   */
  async getReferralStats(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const stats = await referralService.getReferralStats(userId);
    return ResponseHandler.success(reply, 'Referral stats fetched successfully', stats);
  }

  /**
   * Claim referral reward
   */
  async claimReward(
    request: FastifyRequest<{ Body: { referralId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const { referralId } = request.body;

    const result = await referralService.claimReferralReward(userId, referralId);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.REFERRAL_CLAIMED, result);
  }

  /**
   * Get referral leaderboard
   */
  async getLeaderboard(
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply
  ) {
    const limit = parseInt(request.query.limit || '10');
    const leaderboard = await referralService.getReferralLeaderboard(limit);
    return ResponseHandler.success(reply, 'Leaderboard fetched successfully', {
      leaderboard,
    });
  }
}

export const referralController = new ReferralController();
