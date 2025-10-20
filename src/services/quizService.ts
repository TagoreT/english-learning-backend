import { prisma } from '../config/database';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { ErrorCode } from '../constants/errorCodes';

export class QuizService {
  /**
   * Create a new quiz
   */
  async createQuiz(
    instructorUserId: string,
    data: {
      courseId: string;
      title: string;
      difficulty: string;
      unlockSequence?: number;
      passingScore?: number;
      questions: Array<{
        questionData: any;
        correctAnswer: any;
        points: number;
        position: number;
      }>;
    }
  ): Promise<any> {
    // Verify instructor owns the course
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      include: { instructor: true },
    });

    if (!course) {
      throw new NotFoundError(ERROR_MESSAGES.COURSE_NOT_FOUND, ErrorCode.COURSE_NOT_FOUND);
    }

    if (course.instructor.userId !== instructorUserId) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    // Create quiz with questions in transaction
    const quiz = await prisma.quiz.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        difficulty: data.difficulty as any,
        unlockSequence: data.unlockSequence || 0,
        passingScore: data.passingScore || 70,
        questions: {
          create: data.questions,
        },
      },
      include: {
        questions: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return quiz;
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(quizId: string, userId?: string): Promise<any> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            questionData: true,
            points: true,
            position: true,
            // Don't include correctAnswer for students
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError(ERROR_MESSAGES.QUIZ_NOT_FOUND, ErrorCode.QUIZ_NOT_FOUND);
    }

    // Check if user has attempted this quiz
    let attempts: any[] = [];
    if (userId) {
      attempts = await prisma.quizAttempt.findMany({
        where: {
          userId,
          quizId,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    }

    return {
      ...quiz,
      userAttempts: attempts,
    };
  }

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(
    userId: string,
    data: {
      quizId: string;
      answers: Array<{
        questionId: string;
        answer: any;
      }>;
    }
  ): Promise<any> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: data.quizId },
      include: {
        questions: true,
        course: true,
      },
    });

    if (!quiz) {
      throw new NotFoundError(ERROR_MESSAGES.QUIZ_NOT_FOUND, ErrorCode.QUIZ_NOT_FOUND);
    }

    // Check if user is enrolled in course
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: quiz.courseId,
        },
      },
    });

    if (!enrollment && quiz.course.price > 0) {
      throw new AuthorizationError(ERROR_MESSAGES.NOT_ENROLLED);
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const results: any[] = [];

    for (const question of quiz.questions) {
      totalPoints += question.points;

      const userAnswer = data.answers.find((a) => a.questionId === question.id);

      const isCorrect = userAnswer
        ? JSON.stringify(userAnswer.answer) === JSON.stringify(question.correctAnswer)
        : false;

      if (isCorrect) {
        earnedPoints += question.points;
      }

      results.push({
        questionId: question.id,
        userAnswer: userAnswer?.answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
      });
    }

    const score = (earnedPoints / totalPoints) * 100;

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: data.quizId,
        score,
        details: {
          results,
          totalPoints,
          earnedPoints,
          passed: score >= quiz.passingScore,
        },
      },
    });

    return {
      ...attempt,
      passed: score >= quiz.passingScore,
    };
  }

  /**
   * Get user's quiz attempts
   */
  async getUserQuizAttempts(userId: string, quizId?: string): Promise<any[]> {
    const where: any = { userId };
    if (quizId) {
      where.quizId = quizId;
    }

    const attempts = await prisma.quizAttempt.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            passingScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return attempts;
  }

  /**
   * Update quiz
   */
  async updateQuiz(
    quizId: string,
    instructorUserId: string,
    data: {
      title?: string;
      difficulty?: string;
      unlockSequence?: number;
      passingScore?: number;
    }
  ): Promise<any> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: {
          include: {
            instructor: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError(ERROR_MESSAGES.QUIZ_NOT_FOUND, ErrorCode.QUIZ_NOT_FOUND);
    }

    if (quiz.course.instructor.userId !== instructorUserId) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...data,
        ...(data.difficulty && { difficulty: data.difficulty as any }),
      },
    });

    return updated;
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(quizId: string, instructorUserId: string): Promise<void> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: {
          include: {
            instructor: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError(ERROR_MESSAGES.QUIZ_NOT_FOUND, ErrorCode.QUIZ_NOT_FOUND);
    }

    if (quiz.course.instructor.userId !== instructorUserId) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    await prisma.quiz.delete({
      where: { id: quizId },
    });
  }
}

export const quizService = new QuizService();
