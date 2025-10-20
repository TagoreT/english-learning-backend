import { z } from 'zod';

// Update profile schema
export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  learningGoals: z.string().max(1000).optional(),
  languageLevel: z.enum([
    'A1_BEGINNER',
    'A2_ELEMENTARY',
    'B1_INTERMEDIATE',
    'B2_UPPER_INTERMEDIATE',
    'C1_ADVANCED',
    'C2_PROFICIENCY',
  ]).optional(),
  timezone: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Update avatar schema
export const updateAvatarSchema = z.object({
  avatarUrl: z.string().url(),
});

export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;

// User query params
export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['USER', 'INSTRUCTOR', 'ADMIN', 'SUPERADMIN']).optional(),
});

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
