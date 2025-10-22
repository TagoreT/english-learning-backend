import { z } from 'zod';

// Create quiz schema
export const createQuizSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1).max(200),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  unlockSequence: z.number().int().min(0).default(0),
  passingScore: z.number().min(0).max(100).default(70),
  questions: z.array(
    z.object({
      questionData: z.object({
        text: z.string().min(1),
        options: z.array(z.string()).min(2).optional(),
        type: z.enum(['multiple_choice', 'true_false', 'fill_blank']).default('multiple_choice'),
      }),
      correctAnswer: z.any(), // Can be string, number, array, etc.
      points: z.number().positive().default(1),
      position: z.number().int().min(0),
    })
  ).min(1),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;

// Update quiz schema
export const updateQuizSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  unlockSequence: z.number().int().min(0).optional(),
  passingScore: z.number().min(0).max(100).optional(),
});

export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;

// Submit quiz attempt schema
export const submitQuizAttemptSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.any(), // User's answer
    })
  ),
});

export type SubmitQuizAttemptInput = z.infer<typeof submitQuizAttemptSchema>;

// Alias for backward compatibility
export const submitQuizSchema = submitQuizAttemptSchema;

// Get quizzes query
export const getQuizzesQuerySchema = z.object({
  courseId: z.string().uuid().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type GetQuizzesQuery = z.infer<typeof getQuizzesQuerySchema>;
