import { z } from 'zod';

// Assess pronunciation schema
export const assessPronunciationSchema = z.object({
  audioUrl: z.string().url('Audio URL must be a valid URL'),
  contentText: z.string().min(1, 'Content text is required').max(1000),
  language: z.string().default('en-US'),
});

export type AssessPronunciationInput = z.infer<typeof assessPronunciationSchema>;

// Get pronunciation history schema
export const getPronunciationHistorySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export type GetPronunciationHistoryInput = z.infer<typeof getPronunciationHistorySchema>;
