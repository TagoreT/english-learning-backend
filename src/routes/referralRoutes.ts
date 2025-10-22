import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { referralController } from '../controllers/referralController';
import { authMiddleware } from '../middlewares/auth';
import { zodValidationMiddleware } from '../middlewares/zodValidation';
import { claimReferralRewardSchema } from '../validators/referralValidator';

export async function referralRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Apply auth middleware to all routes
  fastify.addHook('onRequest', authMiddleware);

  /**
   * @route GET /api/v1/referrals/my-referrals
   * @desc Get user's referrals with stats
   * @access Private
   */
  fastify.get(
    '/my-referrals',
    {
      schema: {
        tags: ['Referral'],
        description: 'Get all referrals made by the current user',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  referrals: { type: 'array' },
                  stats: {
                    type: 'object',
                    properties: {
                      total: { type: 'number' },
                      pending: { type: 'number' },
                      completed: { type: 'number' },
                      expired: { type: 'number' },
                      totalEarnings: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    referralController.getMyReferrals
  );

  /**
   * @route GET /api/v1/referrals/stats
   * @desc Get referral statistics and referral code
   * @access Private
   */
  fastify.get(
    '/stats',
    {
      schema: {
        tags: ['Referral'],
        description: 'Get referral statistics including referral code and earnings',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  referralCode: { type: 'string' },
                  referralLink: { type: 'string' },
                  stats: {
                    type: 'object',
                    properties: {
                      directReferrals: { type: 'number' },
                      totalEarned: { type: 'number' },
                      pendingRewards: { type: 'number' },
                      currentBalance: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    referralController.getReferralStats
  );

  /**
   * @route POST /api/v1/referrals/claim-reward
   * @desc Claim referral reward manually
   * @access Private
   */
  fastify.post(
    '/claim-reward',
    {
      preHandler: zodValidationMiddleware(claimReferralRewardSchema),
      schema: {
        tags: ['Referral'],
        description: 'Claim a completed referral reward',
        body: {
          type: 'object',
          required: ['referralId'],
          properties: {
            referralId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  claimed: { type: 'boolean' },
                  amount: { type: 'number' },
                  transaction: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    referralController.claimReward
  );

  /**
   * @route GET /api/v1/referrals/leaderboard
   * @desc Get top referrers leaderboard
   * @access Private
   */
  fastify.get(
    '/leaderboard',
    {
      schema: {
        tags: ['Referral'],
        description: 'Get top referrers leaderboard',
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'string', default: '10' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  leaderboard: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        rank: { type: 'number' },
                        userId: { type: 'string' },
                        fullName: { type: 'string' },
                        avatarUrl: { type: 'string' },
                        totalReferrals: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    referralController.getLeaderboard
  );
}
