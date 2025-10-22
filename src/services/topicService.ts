import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { CreateTopicInput, UpdateTopicInput } from '../validators/topicValidator';

class TopicService {
  /**
   * Get all topics (public and user-specific)
   * @param userId User ID (optional)
   * @param filters Filters
   */
  async getAllTopics(
    userId?: string,
    filters?: {
      category?: string;
      difficulty?: string;
      isPublic?: boolean;
      search?: string;
    }
  ) {
    const where: any = {};

    // Filter by public status or user's own topics
    if (filters?.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    } else if (userId) {
      where.OR = [{ isPublic: true }, { suggestedBy: userId }];
    } else {
      where.isPublic = true;
    }

    // Filter by category
    if (filters?.category) {
      where.category = filters.category;
    }

    // Filter by difficulty
    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }

    // Search by title
    if (filters?.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    const topics = await prisma.topic.findMany({
      where,
      include: {
        suggestedByUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return topics;
  }

  /**
   * Get topic by ID
   * @param topicId Topic ID
   */
  async getTopicById(topicId: string) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        suggestedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    return topic;
  }

  /**
   * Create a new topic
   * @param userId User ID
   * @param data Topic data
   */
  async createTopic(userId: string, data: CreateTopicInput, isAdmin: boolean = false) {
    // Check for duplicate topic
    const existingTopic = await prisma.topic.findFirst({
      where: {
        title: {
          equals: data.title,
          mode: 'insensitive',
        },
      },
    });

    if (existingTopic) {
      throw new AppError('Topic with this title already exists', 400);
    }

    // Create topic (auto-approve if admin, otherwise pending)
    const topic = await prisma.topic.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        difficulty: data.difficulty,
        tags: data.tags,
        suggestedBy: userId,
        isPublic: isAdmin, // Auto-approve if admin
      },
      include: {
        suggestedByUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      topic,
      message: isAdmin
        ? 'Topic created and published successfully'
        : 'Topic suggestion submitted for review',
    };
  }

  /**
   * Update topic (Admin only or topic creator)
   * @param topicId Topic ID
   * @param data Update data
   * @param userId User ID
   * @param isAdmin Is admin
   */
  async updateTopic(
    topicId: string,
    data: UpdateTopicInput,
    userId: string,
    isAdmin: boolean = false
  ) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    // Check permissions (only admin or topic creator can update)
    if (!isAdmin && topic.suggestedBy !== userId) {
      throw new AppError('Unauthorized to update this topic', 403);
    }

    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        difficulty: data.difficulty,
        tags: data.tags,
        isPublic: data.isPublic !== undefined ? data.isPublic : topic.isPublic,
      },
      include: {
        suggestedByUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create audit log if admin action
    if (isAdmin && data.isPublic !== undefined) {
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: data.isPublic ? 'TOPIC_APPROVED' : 'TOPIC_REJECTED',
          entityType: 'TOPIC',
          entityId: topicId,
          payload: {
            topicId,
            title: topic.title,
            isPublic: data.isPublic,
          },
        },
      });
    }

    return updatedTopic;
  }

  /**
   * Delete topic (Admin only or topic creator)
   * @param topicId Topic ID
   * @param userId User ID
   * @param isAdmin Is admin
   */
  async deleteTopic(topicId: string, userId: string, isAdmin: boolean = false) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    // Check permissions
    if (!isAdmin && topic.suggestedBy !== userId) {
      throw new AppError('Unauthorized to delete this topic', 403);
    }

    await prisma.topic.delete({
      where: { id: topicId },
    });

    // Create audit log if admin action
    if (isAdmin) {
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: 'TOPIC_DELETED',
          entityType: 'TOPIC',
          entityId: topicId,
          payload: {
            topicId,
            title: topic.title,
          },
        },
      });
    }

    return {
      deleted: true,
      topic,
    };
  }

  /**
   * Get topic categories
   */
  async getCategories() {
    const topics = await prisma.topic.findMany({
      where: { isPublic: true },
      select: { category: true },
      distinct: ['category'],
    });

    return topics.map((t) => t.category);
  }

  /**
   * Get pending topic suggestions (Admin only)
   */
  async getPendingTopics() {
    const pendingTopics = await prisma.topic.findMany({
      where: { isPublic: false },
      include: {
        suggestedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      topics: pendingTopics,
      count: pendingTopics.length,
    };
  }
}

export const topicService = new TopicService();
