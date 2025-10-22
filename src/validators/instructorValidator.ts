import { z } from 'zod';

// Apply to become instructor schema
export const applyInstructorSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000, 'Bio must not exceed 1000 characters'),
  expertise: z.array(z.string()).min(1, 'At least one expertise area is required').max(10),
  experience: z.number().int().min(0, 'Experience cannot be negative'),
  qualification: z.string().min(10, 'Qualification must be at least 10 characters'),
  socialLinks: z.record(z.string().url('Invalid URL')).optional(),
});

export type ApplyInstructorInput = z.infer<typeof applyInstructorSchema>;

// Update instructor profile schema
export const updateInstructorSchema = z.object({
  bio: z.string().min(50).max(1000).optional(),
  expertise: z.array(z.string()).min(1).max(10).optional(),
  socialLinks: z.record(z.string().url()).optional(),
});

export type UpdateInstructorInput = z.infer<typeof updateInstructorSchema>;

// Approve/reject instructor schema (Admin)
export const approveInstructorSchema = z.object({
  approved: z.boolean(),
  notes: z.string().max(500).optional(),
});

export type ApproveInstructorInput = z.infer<typeof approveInstructorSchema>;
