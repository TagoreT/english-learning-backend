import { FastifyRequest, FastifyReply } from 'fastify';
import { quizService } from '../services/quizService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';
import type {
  CreateQuizInput,
  GetQuizzesQuery,
  SubmitQuizAttemptInput,
} from '../validators/quizValidator';

export class QuizController {
  /**
   * Create a new quiz (Instructor/Admin only)
   */
  async createQuiz(
    request: FastifyRequest<{ Body: CreateQuizInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const quiz = await quizService.createQuiz(userId, request.body);
    return ResponseHandler.created(reply, SUCCESS_MESSAGES.QUIZ_CREATED, quiz);
  }

  /**
   * Get all quizzes with filters and pagination
   * Note: This method needs a corresponding service method if used
   */
  async getAllQuizzes(
    request: FastifyRequest<{ Querystring: GetQuizzesQuery }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId;
    // TODO: Implement getAllQuizzes in quizService if needed
    // For now, return empty array or implement based on getCourseById filtering
    const result = { quizzes: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    return ResponseHandler.success(reply, 'Quizzes fetched successfully', result);
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(
    request: FastifyRequest<{ Params: { quizId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId;
    const quiz = await quizService.getQuizById(request.params.quizId, userId);
    return ResponseHandler.success(reply, 'Quiz fetched successfully', quiz);
  }

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(
    request: FastifyRequest<{
      Params: { quizId: string };
      Body: SubmitQuizAttemptInput;
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const result = await quizService.submitQuizAttempt(
      userId,
      request.params.quizId,
      request.body.answers
    );
    return ResponseHandler.created(reply, SUCCESS_MESSAGES.QUIZ_SUBMITTED, result);
  }

  /**
   * Get quiz attempts
   */
  async getQuizAttempts(
    request: FastifyRequest<{ Params: { quizId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const attempts = await quizService.getUserQuizAttempts(userId, request.params.quizId);
    return ResponseHandler.success(reply, 'Quiz attempts fetched successfully', attempts);
  }
}

export const quizController = new QuizController();
