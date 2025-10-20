import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { FileUploadError } from './errors';
import { ErrorCode } from '../constants/errorCodes';
import { ERROR_MESSAGES } from '../constants/messages';
import { nanoid } from 'nanoid';

class FileUploadService {
  private s3Client: S3Client | null = null;
  private bucket: string;

  constructor() {
    this.bucket = env.AWS_S3_BUCKET || '';

    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      this.s3Client = new S3Client({
        region: env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  /**
   * Validate file size
   */
  validateFileSize(fileSize: number): void {
    if (fileSize > env.MAX_FILE_SIZE) {
      throw new FileUploadError(ERROR_MESSAGES.FILE_TOO_LARGE, ErrorCode.FILE_TOO_LARGE);
    }
  }

  /**
   * Validate file type
   */
  validateFileType(mimeType: string): void {
    const allowedTypes = env.ALLOWED_FILE_TYPES.split(',').map((type) => type.trim());

    if (!allowedTypes.includes(mimeType)) {
      throw new FileUploadError(ERROR_MESSAGES.INVALID_FILE_TYPE, ErrorCode.INVALID_FILE_TYPE);
    }
  }

  /**
   * Generate unique file name
   */
  generateFileName(originalName: string): string {
    const ext = originalName.split('.').pop();
    const uniqueId = nanoid(16);
    return `${Date.now()}-${uniqueId}.${ext}`;
  }

  /**
   * Upload file to S3
   */
  async uploadToS3(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder = 'uploads'
  ): Promise<string> {
    if (!this.s3Client) {
      throw new FileUploadError(
        'File storage service not configured',
        ErrorCode.STORAGE_SERVICE_ERROR
      );
    }

    try {
      const key = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      // Return CDN URL if configured, otherwise S3 URL
      if (env.AWS_CLOUDFRONT_URL) {
        return `${env.AWS_CLOUDFRONT_URL}/${key}`;
      }

      return `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new FileUploadError(ERROR_MESSAGES.FILE_UPLOAD_FAILED, ErrorCode.FILE_UPLOAD_FAILED);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFromS3(fileUrl: string): Promise<void> {
    if (!this.s3Client) {
      throw new FileUploadError(
        'File storage service not configured',
        ErrorCode.STORAGE_SERVICE_ERROR
      );
    }

    try {
      // Extract key from URL
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new FileUploadError('Failed to delete file', ErrorCode.FILE_UPLOAD_FAILED);
    }
  }

  /**
   * Generate pre-signed URL for direct upload from client
   */
  async generatePresignedUrl(
    fileName: string,
    mimeType: string,
    folder = 'uploads',
    expiresIn = 3600
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    if (!this.s3Client) {
      throw new FileUploadError(
        'File storage service not configured',
        ErrorCode.STORAGE_SERVICE_ERROR
      );
    }

    try {
      const key = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimeType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      const fileUrl = env.AWS_CLOUDFRONT_URL
        ? `${env.AWS_CLOUDFRONT_URL}/${key}`
        : `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

      return { uploadUrl, fileUrl, key };
    } catch (error) {
      console.error('Presigned URL generation error:', error);
      throw new FileUploadError(
        'Failed to generate upload URL',
        ErrorCode.FILE_UPLOAD_FAILED
      );
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(file: Buffer, originalName: string, mimeType: string): Promise<string> {
    this.validateFileType(mimeType);
    this.validateFileSize(file.length);

    const fileName = this.generateFileName(originalName);
    return await this.uploadToS3(file, fileName, mimeType, 'avatars');
  }

  /**
   * Upload audio file for pronunciation
   */
  async uploadAudio(file: Buffer, originalName: string, mimeType: string): Promise<string> {
    this.validateFileType(mimeType);
    this.validateFileSize(file.length);

    const fileName = this.generateFileName(originalName);
    return await this.uploadToS3(file, fileName, mimeType, 'pronunciations');
  }

  /**
   * Upload course content
   */
  async uploadCourseContent(
    file: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<string> {
    this.validateFileType(mimeType);
    this.validateFileSize(file.length);

    const fileName = this.generateFileName(originalName);
    return await this.uploadToS3(file, fileName, mimeType, 'courses');
  }
}

export const fileUploadService = new FileUploadService();
