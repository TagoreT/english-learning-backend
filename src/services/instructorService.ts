import { prisma } from '../config/database';
import { UserRole } from '@prisma/client';
import { AppError } from '../utils/errors';
import { ApplyInstructorInput, UpdateInstructorInput } from '../validators/instructorValidator';

class InstructorService {
  /**
   * Apply to become an instructor
   * @param userId User ID
   * @param data Application data
   */
  async applyToBeInstructor(userId: string, data: ApplyInstructorInput) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if already an instructor or has pending application
    const existingInstructor = await prisma.instructor.findUnique({
      where: { userId },
    });

    if (existingInstructor) {
      if (existingInstructor.approved) {
        throw new AppError('You are already an approved instructor', 400);
      } else {
        throw new AppError('Your instructor application is pending review', 400);
      }
    }

    // Create instructor profile (pending approval)
    const instructor = await prisma.instructor.create({
      data: {
        userId,
        bio: data.bio,
        approved: false,
        rating: 0,
        expertise: data.expertise,
        experience: data.experience,
        qualification: data.qualification,
        socialLinks: data.socialLinks || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      instructor,
      message: 'Instructor application submitted successfully. Awaiting admin approval.',
    };
  }

  /**
   * Get instructor profile
   * @param instructorId Instructor user ID
   */
  async getInstructorProfile(instructorId: string) {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        courses: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            thumbnailUrl: true,
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      throw new AppError('Instructor not found', 404);
    }

    if (!instructor.approved) {
      throw new AppError('Instructor profile is not yet approved', 403);
    }

    return instructor;
  }

  /**
   * Get instructor's courses
   * @param instructorId Instructor user ID
   */
  async getInstructorCourses(instructorId: string) {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorId },
    });

    if (!instructor) {
      throw new AppError('Instructor not found', 404);
    }

    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: {
            enrollments: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      courses,
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.isPublished).length,
    };
  }

  /**
   * Get instructor earnings
   * @param instructorId Instructor user ID
   */
  async getInstructorEarnings(instructorId: string) {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorId },
    });

    if (!instructor) {
      throw new AppError('Instructor not found', 404);
    }

    // Get all enrollments for instructor's courses
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        course: {
          instructorId,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });

    const totalEarnings = enrollments.reduce((sum, enrollment) => {
      return sum + enrollment.course.price;
    }, 0);

    // Calculate platform commission (e.g., 20%)
    const PLATFORM_COMMISSION_RATE = 0.2;
    const platformCommission = totalEarnings * PLATFORM_COMMISSION_RATE;
    const netEarnings = totalEarnings - platformCommission;

    return {
      totalEarnings,
      platformCommission,
      netEarnings,
      totalEnrollments: enrollments.length,
      courseBreakdown: enrollments.reduce((acc: any, enrollment) => {
        const courseId = enrollment.course.id;
        if (!acc[courseId]) {
          acc[courseId] = {
            courseId,
            courseTitle: enrollment.course.title,
            price: enrollment.course.price,
            enrollments: 0,
            revenue: 0,
          };
        }
        acc[courseId].enrollments++;
        acc[courseId].revenue += enrollment.course.price;
        return acc;
      }, {}),
    };
  }

  /**
   * Update instructor profile
   * @param instructorId Instructor user ID
   * @param data Update data
   */
  async updateInstructorProfile(instructorId: string, data: UpdateInstructorInput) {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorId },
    });

    if (!instructor) {
      throw new AppError('Instructor profile not found', 404);
    }

    const updatedInstructor = await prisma.instructor.update({
      where: { userId: instructorId },
      data: {
        bio: data.bio,
        expertise: data.expertise,
        socialLinks: data.socialLinks,
      },
    });

    return updatedInstructor;
  }

  /**
   * Approve or reject instructor application (Admin only)
   * @param instructorId Instructor user ID
   * @param approved Approval status
   * @param adminId Admin user ID
   * @param notes Admin notes
   */
  async approveInstructor(
    instructorId: string,
    approved: boolean,
    adminId: string,
    notes?: string
  ) {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorId },
      include: { user: true },
    });

    if (!instructor) {
      throw new AppError('Instructor application not found', 404);
    }

    if (instructor.approved) {
      throw new AppError('Instructor already approved', 400);
    }

    // Update instructor status and user role if approved
    const result = await prisma.$transaction(async (tx) => {
      // Update instructor approval status
      const updatedInstructor = await tx.instructor.update({
        where: { userId: instructorId },
        data: { approved },
      });

      // If approved, update user role to INSTRUCTOR
      if (approved) {
        await tx.user.update({
          where: { id: instructorId },
          data: { role: UserRole.INSTRUCTOR },
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: approved ? 'INSTRUCTOR_APPROVED' : 'INSTRUCTOR_REJECTED',
          entityType: 'INSTRUCTOR',
          entityId: instructor.id,
          payload: {
            instructorId,
            approved,
            notes,
          },
        },
      });

      return updatedInstructor;
    });

    return {
      instructor: result,
      message: approved
        ? 'Instructor application approved successfully'
        : 'Instructor application rejected',
    };
  }

  /**
   * Get all instructor applications (Admin only)
   * @param status Filter by approval status
   */
  async getAllInstructorApplications(status?: 'pending' | 'approved' | 'all') {
    const where: any = {};

    if (status === 'pending') {
      where.approved = false;
    } else if (status === 'approved') {
      where.approved = true;
    }

    const instructors = await prisma.instructor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      instructors,
      total: instructors.length,
      pending: instructors.filter((i) => !i.approved).length,
      approved: instructors.filter((i) => i.approved).length,
    };
  }
}

export const instructorService = new InstructorService();
