import { FastifyRequest, FastifyReply } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { fileUploadService } from '../utils/fileUpload';
import { ResponseHandler } from '../utils/responseHandler';
import { AppError } from '../utils/errors';
import { SUCCESS_MESSAGES } from '../constants/messages';

interface UploadRequestBody {
  fileType: 'avatar' | 'audio' | 'document' | 'video' | 'image' | 'course_content';
  folder?: string;
}

export class UploadController {
  /**
   * Upload file to S3/storage
   */
  async uploadFile(
    request: FastifyRequest<{ Body: UploadRequestBody }>,
    reply: FastifyReply
  ) {
    try {
      // Get multipart file data
      const data = await request.file();

      if (!data) {
        throw new AppError('No file uploaded', 400);
      }

      const file = data as MultipartFile;

      // Get file buffer
      const buffer = await file.toBuffer();

      // Validate file size
      fileUploadService.validateFileSize(buffer.length);

      // Validate file type
      fileUploadService.validateFileType(file.mimetype);

      // Generate unique file name
      const fileName = fileUploadService.generateFileName(file.filename);

      // Determine folder based on fileType from body fields
      const fileType = (data.fields as any)?.fileType?.value || 'uploads';
      const customFolder = (data.fields as any)?.folder?.value;

      let folder = customFolder || 'uploads';

      // Map file types to folders
      const folderMap: Record<string, string> = {
        avatar: 'avatars',
        audio: 'audio',
        document: 'documents',
        video: 'videos',
        image: 'images',
        course_content: 'courses',
      };

      if (!customFolder && folderMap[fileType]) {
        folder = folderMap[fileType];
      }

      // Upload to S3
      const fileUrl = await fileUploadService.uploadToS3(buffer, fileName, file.mimetype, folder);

      return ResponseHandler.created(reply, SUCCESS_MESSAGES.FILE_UPLOAD_SUCCESS, {
        fileUrl,
        fileName,
        mimeType: file.mimetype,
        size: buffer.length,
        folder,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('File upload failed', 500);
    }
  }

  /**
   * Delete file from S3/storage
   */
  async deleteFile(request: FastifyRequest<{ Params: { fileKey: string } }>, reply: FastifyReply) {
    const { fileKey } = request.params;

    // Reconstruct file URL (assuming CDN or S3 URL format)
    // You might need to adjust this based on your actual URL structure
    const fileUrl = decodeURIComponent(fileKey);

    await fileUploadService.deleteFromS3(fileUrl);

    return ResponseHandler.success(reply, SUCCESS_MESSAGES.FILE_DELETE_SUCCESS, {
      fileKey,
      deleted: true,
    });
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(
    request: FastifyRequest<{ Params: { fileKey: string }; Querystring: { expiresIn?: string } }>,
    reply: FastifyReply
  ) {
    const { fileKey } = request.params;
    const expiresIn = parseInt(request.query.expiresIn || '3600');

    const signedUrl = await fileUploadService.getSignedUrl(fileKey, expiresIn);

    return ResponseHandler.success(reply, 'Signed URL generated', {
      signedUrl,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  }

  /**
   * Upload avatar specifically
   */
  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;

    // Get multipart file data
    const data = await request.file();

    if (!data) {
      throw new AppError('No file uploaded', 400);
    }

    const file = data as MultipartFile;

    // Validate it's an image
    if (!file.mimetype.startsWith('image/')) {
      throw new AppError('Avatar must be an image file', 400);
    }

    // Get file buffer
    const buffer = await file.toBuffer();

    // Validate file size (max 5MB for avatars)
    const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
    if (buffer.length > MAX_AVATAR_SIZE) {
      throw new AppError('Avatar size must be less than 5MB', 400);
    }

    // Generate unique file name
    const fileName = fileUploadService.generateFileName(file.filename);

    // Upload to S3 in avatars folder
    const avatarUrl = await fileUploadService.uploadAvatar(buffer, fileName, file.mimetype);

    // Update user's avatar in database
    const { prisma } = await import('../config/database');
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return ResponseHandler.success(reply, 'Avatar uploaded successfully', {
      avatarUrl,
    });
  }

  /**
   * Upload audio file for pronunciation
   */
  async uploadAudio(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;

    // Get multipart file data
    const data = await request.file();

    if (!data) {
      throw new AppError('No audio file uploaded', 400);
    }

    const file = data as MultipartFile;

    // Validate it's an audio file
    if (!file.mimetype.startsWith('audio/')) {
      throw new AppError('File must be an audio file', 400);
    }

    // Get file buffer
    const buffer = await file.toBuffer();

    // Validate file size
    fileUploadService.validateFileSize(buffer.length);

    // Generate unique file name
    const fileName = fileUploadService.generateFileName(file.filename);

    // Upload to S3 in audio folder
    const audioUrl = await fileUploadService.uploadAudio(buffer, fileName, file.mimetype);

    return ResponseHandler.success(reply, 'Audio uploaded successfully', {
      audioUrl,
      fileName,
      mimeType: file.mimetype,
      size: buffer.length,
    });
  }
}

export const uploadController = new UploadController();
