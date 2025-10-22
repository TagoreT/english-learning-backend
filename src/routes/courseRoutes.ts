import { FastifyInstance } from 'fastify';
import { courseController } from '../controllers/courseController';
import { authMiddleware } from '../middlewares/auth';
import { requireInstructor } from '../middlewares/role';
import { zodValidationMiddleware, validateQuery } from '../middlewares/zodValidation';
import {
  createCourseSchema,
  updateCourseSchema,
  getCoursesQuerySchema,
  addCourseContentSchema,
  updateProgressSchema,
} from '../validators/courseValidator';

export async function courseRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.get('/', {
    preHandler: [validateQuery(getCoursesQuerySchema)],
    schema: {
      tags: ['Courses'],
      description: 'Get all courses with filters and pagination',
    },
  }, courseController.getAllCourses);

  fastify.get('/:courseId', {
    schema: {
      tags: ['Courses'],
      description: 'Get course by ID',
    },
  }, courseController.getCourseById);

  // Protected routes (require authentication)
  fastify.post('/:courseId/enroll', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Courses'],
      description: 'Enroll in a course',
    },
  }, courseController.enrollCourse);

  fastify.get('/my/enrollments', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Courses'],
      description: 'Get my enrolled courses',
    },
  }, courseController.getMyEnrollments);

  fastify.put('/:courseId/progress', {
    preHandler: [authMiddleware, zodValidationMiddleware(updateProgressSchema)],
    schema: {
      tags: ['Courses'],
      description: 'Update course progress',
    },
  }, courseController.updateProgress);

  // Instructor-only routes
  fastify.post('/', {
    preHandler: [authMiddleware, requireInstructor, zodValidationMiddleware(createCourseSchema)],
    schema: {
      tags: ['Courses', 'Instructor'],
      description: 'Create a new course (Instructor only)',
    },
  }, courseController.createCourse);

  fastify.put('/:courseId', {
    preHandler: [authMiddleware, requireInstructor, zodValidationMiddleware(updateCourseSchema)],
    schema: {
      tags: ['Courses', 'Instructor'],
      description: 'Update course (Instructor - owner only)',
    },
  }, courseController.updateCourse);

  fastify.delete('/:courseId', {
    preHandler: [authMiddleware, requireInstructor],
    schema: {
      tags: ['Courses', 'Instructor'],
      description: 'Delete course (Instructor - owner only)',
    },
  }, courseController.deleteCourse);

  fastify.post('/:courseId/content', {
    preHandler: [authMiddleware, requireInstructor, zodValidationMiddleware(addCourseContentSchema)],
    schema: {
      tags: ['Courses', 'Instructor'],
      description: 'Add course content (Instructor - owner only)',
    },
  }, courseController.addCourseContent);
}
