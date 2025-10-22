import { FastifyRequest, FastifyReply } from 'fastify';
import { topicService } from '../services/topicService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';
import { CreateTopicInput, UpdateTopicInput } from '../validators/topicValidator';
import { UserRole } from '@prisma/client';

export class TopicController {
  /**
   * Get all topics
   */
  async getAllTopics(
    request: FastifyRequest<{
      Querystring: {
        category?: string;
        difficulty?: string;
        isPublic?: string;
        search?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId;
    const filters = {
      category: request.query.category,
      difficulty: request.query.difficulty,
      isPublic: request.query.isPublic === 'true' ? true : request.query.isPublic === 'false' ? false : undefined,
      search: request.query.search,
    };

    const topics = await topicService.getAllTopics(userId, filters);
    return ResponseHandler.success(reply, 'Topics fetched successfully', { topics });
  }

  /**
   * Get topic by ID
   */
  async getTopicById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const topic = await topicService.getTopicById(id);
    return ResponseHandler.success(reply, 'Topic fetched successfully', topic);
  }

  /**
   * Create a new topic
   */
  async createTopic(
    request: FastifyRequest<{ Body: CreateTopicInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const isAdmin = [UserRole.ADMIN, UserRole.SUPERADMIN].includes(request.user!.role as UserRole);

    const result = await topicService.createTopic(userId, request.body, isAdmin);
    return ResponseHandler.created(reply, result.message, result.topic);
  }

  /**
   * Update topic
   */
  async updateTopic(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateTopicInput;
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const userId = request.user!.userId;
    const isAdmin = [UserRole.ADMIN, UserRole.SUPERADMIN].includes(request.user!.role as UserRole);

    const updatedTopic = await topicService.updateTopic(id, request.body, userId, isAdmin);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.TOPIC_UPDATED, updatedTopic);
  }

  /**
   * Delete topic
   */
  async deleteTopic(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const userId = request.user!.userId;
    const isAdmin = [UserRole.ADMIN, UserRole.SUPERADMIN].includes(request.user!.role as UserRole);

    const result = await topicService.deleteTopic(id, userId, isAdmin);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.TOPIC_DELETED, result);
  }

  /**
   * Get topic categories
   */
  async getCategories(request: FastifyRequest, reply: FastifyReply) {
    const categories = await topicService.getCategories();
    return ResponseHandler.success(reply, 'Categories fetched successfully', { categories });
  }

  /**
   * Get pending topic suggestions (Admin only)
   */
  async getPendingTopics(request: FastifyRequest, reply: FastifyReply) {
    const result = await topicService.getPendingTopics();
    return ResponseHandler.success(reply, 'Pending topics fetched successfully', result);
  }
}

export const topicController = new TopicController();
