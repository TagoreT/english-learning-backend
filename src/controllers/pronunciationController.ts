import { FastifyRequest, FastifyReply } from 'fastify';
import { pronunciationService } from '../services/pronunciationService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';
import { AssessPronunciationInput } from '../validators/pronunciationValidator';

export class PronunciationController {
  /**
   * Assess pronunciation
   */
  async assessPronunciation(
    request: FastifyRequest<{ Body: AssessPronunciationInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const result = await pronunciationService.assessPronunciation(userId, request.body);
    return ResponseHandler.created(reply, result.message, {
      pronunciation: result.pronunciation,
      scores: result.scores,
      feedback: result.feedback,
    });
  }

  /**
   * Get pronunciation history
   */
  async getPronunciationHistory(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const page = parseInt(request.query.page || '1');
    const limit = parseInt(request.query.limit || '10');

    const result = await pronunciationService.getPronunciationHistory(userId, page, limit);
    return ResponseHandler.success(reply, 'Pronunciation history fetched', result);
  }

  /**
   * Get pronunciation feedback
   */
  async getPronunciationFeedback(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const { id } = request.params;

    const feedback = await pronunciationService.getPronunciationFeedback(id, userId);
    return ResponseHandler.success(reply, 'Pronunciation feedback fetched', feedback);
  }

  /**
   * Get pronunciation statistics
   */
  async getPronunciationStats(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const stats = await pronunciationService.getPronunciationStats(userId);
    return ResponseHandler.success(reply, 'Pronunciation statistics fetched', stats);
  }
}

export const pronunciationController = new PronunciationController();
