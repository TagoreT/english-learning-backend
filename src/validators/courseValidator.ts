import { z } from 'zod';

// Create course schema
export const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).default(0),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  thumbnailUrl: z.string().url().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// Update course schema
export const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().optional(),
  isPublished: z.boolean().optional(),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// Add course content schema
export const addCourseContentSchema = z.object({
  courseId: z.string().uuid(),
  type: z.enum(['VIDEO', 'PDF', 'QUIZ', 'AUDIO', 'TEXT']),
  title: z.string().min(1).max(200),
  metadata: z.object({
    url: z.string().optional(),
    duration: z.number().optional(),
    size: z.number().optional(),
    description: z.string().optional(),
  }),
  position: z.number().int().min(0),
});

export type AddCourseContentInput = z.infer<typeof addCourseContentSchema>;

// Enroll in course schema
export const enrollCourseSchema = z.object({
  courseId: z.string().uuid(),
});

export type EnrollCourseInput = z.infer<typeof enrollCourseSchema>;

// Update progress schema
export const updateProgressSchema = z.object({
  courseId: z.string().uuid(),
  progress: z.number().min(0).max(100),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

// Get courses query
export const getCoursesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isPublished: z.coerce.boolean().optional(),
  instructorId: z.string().uuid().optional(),
});

export type GetCoursesQuery = z.infer<typeof getCoursesQuerySchema>;
