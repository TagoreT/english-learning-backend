import { z } from 'zod';

// Create topic schema
export const createTopicSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must not exceed 200 characters'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().max(1000).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;

// Update topic schema (Admin)
export const updateTopicSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  category: z.string().min(2).optional(),
  description: z.string().max(1000).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
