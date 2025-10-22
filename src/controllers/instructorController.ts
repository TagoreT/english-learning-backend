import { FastifyRequest, FastifyReply } from 'fastify';
import { instructorService } from '../services/instructorService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';
import { ApplyInstructorInput, UpdateInstructorInput, ApproveInstructorInput } from '../validators/instructorValidator';

export class InstructorController {
  /**
   * Apply to become an instructor
   */
  async applyToBeInstructor(
    request: FastifyRequest<{ Body: ApplyInstructorInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const result = await instructorService.applyToBeInstructor(userId, request.body);
    return ResponseHandler.created(reply, result.message, result.instructor);
  }

  /**
   * Get instructor profile by ID
   */
  async getInstructorProfile(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const instructor = await instructorService.getInstructorProfile(id);
    return ResponseHandler.success(reply, 'Instructor profile fetched', instructor);
  }

  /**
   * Get instructor's courses
   */
  async getInstructorCourses(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const result = await instructorService.getInstructorCourses(id);
    return ResponseHandler.success(reply, 'Instructor courses fetched', result);
  }

  /**
   * Get instructor earnings (own profile only)
   */
  async getInstructorEarnings(request: FastifyRequest, reply: FastifyReply) {
    const instructorId = request.user!.userId;
    const earnings = await instructorService.getInstructorEarnings(instructorId);
    return ResponseHandler.success(reply, 'Earnings fetched successfully', earnings);
  }

  /**
   * Update instructor profile
   */
  async updateInstructorProfile(
    request: FastifyRequest<{ Body: UpdateInstructorInput }>,
    reply: FastifyReply
  ) {
    const instructorId = request.user!.userId;
    const updatedInstructor = await instructorService.updateInstructorProfile(
      instructorId,
      request.body
    );
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.PROFILE_UPDATED, updatedInstructor);
  }

  /**
   * Approve or reject instructor application (Admin only)
   */
  async approveInstructor(
    request: FastifyRequest<{
      Params: { id: string };
      Body: ApproveInstructorInput;
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const adminId = request.user!.userId;
    const { approved, notes } = request.body;

    const result = await instructorService.approveInstructor(id, approved, adminId, notes);
    return ResponseHandler.success(reply, result.message, result.instructor);
  }

  /**
   * Get all instructor applications (Admin only)
   */
  async getAllInstructorApplications(
    request: FastifyRequest<{ Querystring: { status?: string } }>,
    reply: FastifyReply
  ) {
    const status = request.query.status as 'pending' | 'approved' | 'all' | undefined;
    const result = await instructorService.getAllInstructorApplications(status);
    return ResponseHandler.success(reply, 'Instructor applications fetched', result);
  }
}

export const instructorController = new InstructorController();
