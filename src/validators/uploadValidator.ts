import { z } from 'zod';

// Upload file schema
export const uploadFileSchema = z.object({
  fileType: z.enum(['avatar', 'audio', 'document', 'video', 'image', 'course_content']),
  folder: z.string().optional(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;

// Delete file schema
export const deleteFileSchema = z.object({
  fileKey: z.string().min(1, 'File key is required'),
});

export type DeleteFileInput = z.infer<typeof deleteFileSchema>;

// Get signed URL schema
export const getSignedUrlSchema = z.object({
  fileKey: z.string().min(1, 'File key is required'),
  expiresIn: z.number().int().positive().max(3600).optional().default(3600), // Max 1 hour
});

export type GetSignedUrlInput = z.infer<typeof getSignedUrlSchema>;
