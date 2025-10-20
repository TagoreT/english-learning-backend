import { prisma } from '../config/database';
import { NotFoundError, ConflictError, AuthorizationError } from '../utils/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { ErrorCode } from '../constants/errorCodes';

export class CourseService {
  /**
   * Create a new course (Instructor only)
   */
  async createCourse(
    instructorUserId: string,
    data: {
      title: string;
      description?: string;
      price?: number;
      categories?: string[];
      tags?: string[];
      thumbnailUrl?: string;
    }
  ): Promise<any> {
    // Check if user is an instructor
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorUserId },
    });

    if (!instructor) {
      throw new AuthorizationError(ERROR_MESSAGES.INSTRUCTOR_NOT_FOUND);
    }

    if (!instructor.approved) {
      throw new AuthorizationError(ERROR_MESSAGES.INSTRUCTOR_NOT_APPROVED);
    }

    const course = await prisma.course.create({
      data: {
        ...data,
        instructorId: instructor.id,
      },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return course;
  }

  /**
   * Get course by ID
   */
  async getCourseById(courseId: string, userId?: string): Promise<any> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        content: {
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
            quizzes: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError(ERROR_MESSAGES.COURSE_NOT_FOUND, ErrorCode.COURSE_NOT_FOUND);
    }

    // Check enrollment if user is provided
    let enrollment = null;
    if (userId) {
      enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });
    }

    return {
      ...course,
      isEnrolled: !!enrollment,
      progress: enrollment?.progress || 0,
    };
  }

  /**
   * Get all courses with filters
   */
  async getCourses(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isPublished?: boolean;
    instructorId?: string;
  }): Promise<{ courses: any[]; total: number }> {
    const { page = 1, limit = 10, search, category, minPrice, maxPrice, isPublished, instructorId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categories = { has: category };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    if (instructorId) {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: instructorId },
      });
      if (instructor) {
        where.instructorId = instructor.id;
      }
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: {
            include: {
              user: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, total };
  }

  /**
   * Update course
   */
  async updateCourse(courseId: string, instructorUserId: string, data: any): Promise<any> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true },
    });

    if (!course) {
      throw new NotFoundError(ERROR_MESSAGES.COURSE_NOT_FOUND, ErrorCode.COURSE_NOT_FOUND);
    }

    // Check ownership
    if (course.instructor.userId !== instructorUserId) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data,
      include: {
        instructor: {
          include: {
            user: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId: string, instructorUserId: string): Promise<void> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true },
    });

    if (!course) {
      throw new NotFoundError(ERROR_MESSAGES.COURSE_NOT_FOUND, ErrorCode.COURSE_NOT_FOUND);
    }

    // Check ownership
    if (course.instructor.userId !== instructorUserId) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    await prisma.course.delete({
      where: { id: courseId },
    });
  }

  /**
   * Add course content
   */
  async addCourseContent(
    courseId: string,
    instructorUserId: string,
    data: {
      type: string;
      title: string;
      metadata: any;
      position: number;
    }
  ): Promise<any> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true },
    });

    if (!course) {
      throw new NotFoundError(ERROR_MESSAGES.COURSE_NOT_FOUND, ErrorCode.COURSE_NOT_FOUND);
    }

    // Check ownership
    if (course.instructor.userId !== instructorUserId) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    const content = await prisma.courseContent.create({
      data: {
        courseId,
        type: data.type as any,
        title: data.title,
        metadata: data.metadata,
        position: data.position,
      },
    });

    return content;
  }

  /**
   * Enroll in course
   */
  async enrollCourse(userId: string, courseId: string): Promise<any> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError(ERROR_MESSAGES.COURSE_NOT_FOUND, ErrorCode.COURSE_NOT_FOUND);
    }

    if (!course.isPublished) {
      throw new ConflictError(
        ERROR_MESSAGES.COURSE_NOT_PUBLISHED,
        ErrorCode.COURSE_NOT_PUBLISHED
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictError(ERROR_MESSAGES.ALREADY_ENROLLED, ErrorCode.ALREADY_ENROLLED);
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return enrollment;
  }

  /**
   * Update course progress
   */
  async updateProgress(userId: string, courseId: string, progress: number): Promise<any> {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundError(ERROR_MESSAGES.NOT_ENROLLED, ErrorCode.NOT_ENROLLED);
    }

    const updated = await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        ...(progress >= 100 && { completedAt: new Date() }),
      },
    });

    return updated;
  }

  /**
   * Get user's enrolled courses
   */
  async getEnrolledCourses(userId: string): Promise<any[]> {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments;
  }
}

export const courseService = new CourseService();
