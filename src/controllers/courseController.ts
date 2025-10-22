import { FastifyRequest, FastifyReply } from 'fastify';
import { courseService } from '../services/courseService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';
import type {
  CreateCourseInput,
  UpdateCourseInput,
  GetCoursesQuery,
  AddCourseContentInput,
  UpdateProgressInput,
} from '../validators/courseValidator';

export class CourseController {
  /**
   * Create a new course (Instructor only)
   */
  async createCourse(
    request: FastifyRequest<{ Body: CreateCourseInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const course = await courseService.createCourse(userId, request.body);
    return ResponseHandler.created(reply, SUCCESS_MESSAGES.COURSE_CREATED, course);
  }

  /**
   * Get all courses with filters and pagination
   */
  async getAllCourses(
    request: FastifyRequest<{ Querystring: GetCoursesQuery }>,
    reply: FastifyReply
  ) {
    const result = await courseService.getCourses(request.query);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.COURSES_FETCHED, result);
  }

  /**
   * Get course by ID
   */
  async getCourseById(
    request: FastifyRequest<{ Params: { courseId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId;
    const course = await courseService.getCourseById(request.params.courseId, userId);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.COURSE_FETCHED, course);
  }

  /**
   * Update course (Instructor - owner only)
   */
  async updateCourse(
    request: FastifyRequest<{
      Params: { courseId: string };
      Body: UpdateCourseInput;
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const course = await courseService.updateCourse(
      request.params.courseId,
      userId,
      request.body
    );
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.COURSE_UPDATED, course);
  }

  /**
   * Delete course (Instructor - owner only)
   */
  async deleteCourse(
    request: FastifyRequest<{ Params: { courseId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    await courseService.deleteCourse(request.params.courseId, userId);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.COURSE_DELETED);
  }

  /**
   * Enroll in a course
   */
  async enrollCourse(
    request: FastifyRequest<{ Params: { courseId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const enrollment = await courseService.enrollCourse(userId, request.params.courseId);
    return ResponseHandler.created(reply, SUCCESS_MESSAGES.ENROLLMENT_SUCCESS, enrollment);
  }

  /**
   * Get user's enrolled courses
   */
  async getMyEnrollments(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const enrollments = await courseService.getEnrolledCourses(userId);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.ENROLLMENTS_FETCHED, enrollments);
  }

  /**
   * Update course progress
   */
  async updateProgress(
    request: FastifyRequest<{
      Params: { courseId: string };
      Body: UpdateProgressInput;
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const enrollment = await courseService.updateProgress(
      userId,
      request.params.courseId,
      request.body.progress
    );
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.PROGRESS_UPDATED, enrollment);
  }

  /**
   * Add course content (Instructor - owner only)
   */
  async addCourseContent(
    request: FastifyRequest<{
      Params: { courseId: string };
      Body: Omit<AddCourseContentInput, 'courseId'>;
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.userId;
    const content = await courseService.addCourseContent(
      request.params.courseId,
      userId,
      request.body
    );
    return ResponseHandler.created(reply, SUCCESS_MESSAGES.CONTENT_ADDED, content);
  }
}

export const courseController = new CourseController();
