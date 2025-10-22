import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { AssessPronunciationInput } from '../validators/pronunciationValidator';

interface PronunciationScore {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronunciationScore: number;
}

interface PronunciationFeedback {
  words: Array<{
    word: string;
    accuracyScore: number;
    errorType?: string;
  }>;
  overallFeedback: string;
}

class PronunciationService {
  /**
   * Assess pronunciation using Azure Speech API or SpeechSuper API
   * This is a placeholder - actual implementation would call external API
   * @param userId User ID
   * @param data Assessment data
   */
  async assessPronunciation(userId: string, data: AssessPronunciationInput) {
    // Create initial record with PENDING status
    const pronunciation = await prisma.pronunciation.create({
      data: {
        userId,
        contentText: data.contentText,
        audioUrl: data.audioUrl,
        scoreJson: null,
        feedback: null,
      },
    });

    // In production, this would:
    // 1. Queue a background job (using BullMQ)
    // 2. Worker picks up the job
    // 3. Worker calls Azure Speech API / SpeechSuper API
    // 4. Worker updates the record with scores

    // For now, we'll simulate the API call
    try {
      const assessmentResult = await this.callPronunciationAPI(data.audioUrl, data.contentText, data.language);

      // Update record with results
      const updatedPronunciation = await prisma.pronunciation.update({
        where: { id: pronunciation.id },
        data: {
          scoreJson: assessmentResult.scores,
          feedback: assessmentResult.feedback,
        },
      });

      return {
        pronunciation: updatedPronunciation,
        scores: assessmentResult.scores,
        feedback: assessmentResult.feedback,
        message: 'Pronunciation assessed successfully',
      };
    } catch (error) {
      // If API call fails, mark as failed
      await prisma.pronunciation.update({
        where: { id: pronunciation.id },
        data: {
          feedback: { error: 'Failed to assess pronunciation' },
        },
      });

      throw new AppError('Failed to assess pronunciation. Please try again.', 500);
    }
  }

  /**
   * Get pronunciation history for user
   * @param userId User ID
   * @param page Page number
   * @param limit Items per page
   */
  async getPronunciationHistory(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [pronunciations, total] = await Promise.all([
      prisma.pronunciation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pronunciation.count({
        where: { userId },
      }),
    ]);

    return {
      pronunciations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get detailed feedback for a pronunciation assessment
   * @param pronunciationId Pronunciation ID
   * @param userId User ID
   */
  async getPronunciationFeedback(pronunciationId: string, userId: string) {
    const pronunciation = await prisma.pronunciation.findUnique({
      where: { id: pronunciationId },
    });

    if (!pronunciation) {
      throw new AppError('Pronunciation assessment not found', 404);
    }

    if (pronunciation.userId !== userId) {
      throw new AppError('Unauthorized to view this assessment', 403);
    }

    return {
      id: pronunciation.id,
      contentText: pronunciation.contentText,
      audioUrl: pronunciation.audioUrl,
      scores: pronunciation.scoreJson,
      feedback: pronunciation.feedback,
      createdAt: pronunciation.createdAt,
    };
  }

  /**
   * Get pronunciation statistics for user
   * @param userId User ID
   */
  async getPronunciationStats(userId: string) {
    const pronunciations = await prisma.pronunciation.findMany({
      where: { userId },
      select: {
        scoreJson: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (pronunciations.length === 0) {
      return {
        totalAssessments: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        recentProgress: [],
      };
    }

    // Calculate statistics
    const scores = pronunciations
      .filter((p) => p.scoreJson && typeof p.scoreJson === 'object')
      .map((p) => {
        const scoreData = p.scoreJson as any;
        return scoreData.pronunciationScore || scoreData.overallScore || 0;
      });

    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Recent progress (last 10 assessments)
    const recentProgress = pronunciations.slice(0, 10).map((p, index) => {
      const scoreData = p.scoreJson as any;
      return {
        date: p.createdAt,
        score: scoreData?.pronunciationScore || scoreData?.overallScore || 0,
      };
    });

    return {
      totalAssessments: pronunciations.length,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      lowestScore,
      recentProgress,
    };
  }

  /**
   * Call pronunciation assessment API (Azure Speech or SpeechSuper)
   * This is a placeholder for actual API integration
   */
  private async callPronunciationAPI(
    audioUrl: string,
    referenceText: string,
    language: string
  ): Promise<{ scores: PronunciationScore; feedback: PronunciationFeedback }> {
    // TODO: Implement actual Azure Speech API or SpeechSuper API call
    // For now, return simulated data

    // Simulated API response
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

    // Generate random scores for simulation
    const accuracyScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const fluencyScore = Math.floor(Math.random() * 30) + 70;
    const completenessScore = Math.floor(Math.random() * 30) + 70;
    const pronunciationScore = Math.floor(
      (accuracyScore + fluencyScore + completenessScore) / 3
    );

    const scores: PronunciationScore = {
      accuracyScore,
      fluencyScore,
      completenessScore,
      pronunciationScore,
    };

    // Simulate word-level feedback
    const words = referenceText.split(' ').map((word) => ({
      word,
      accuracyScore: Math.floor(Math.random() * 30) + 70,
      errorType: Math.random() > 0.8 ? 'mispronunciation' : undefined,
    }));

    const feedback: PronunciationFeedback = {
      words,
      overallFeedback:
        pronunciationScore >= 90
          ? 'Excellent pronunciation! Keep up the great work.'
          : pronunciationScore >= 75
          ? 'Good pronunciation. Focus on the words with lower scores.'
          : 'Keep practicing. Pay attention to the highlighted words.',
    };

    return { scores, feedback };
  }
}

export const pronunciationService = new PronunciationService();
