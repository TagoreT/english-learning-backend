import { FastifyRequest, FastifyReply } from 'fastify';
import { adminService } from '../services/adminService';
import { paymentService } from '../services/paymentService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';
import { UpdateUserRoleInput, GenerateReportInput, ProcessWithdrawalInput } from '../validators/adminValidator';
import { TransactionType } from '@prisma/client';

export class AdminController {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await adminService.getDashboardStats();
    return ResponseHandler.success(reply, 'Dashboard stats fetched successfully', stats);
  }

  /**
   * Get all transactions
   */
  async getAllTransactions(
    request: FastifyRequest<{
      Querystring: {
        page?: string;
        limit?: string;
        type?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const page = parseInt(request.query.page || '1');
    const limit = parseInt(request.query.limit || '20');

    const filters = {
      type: request.query.type as TransactionType | undefined,
      status: request.query.status,
      startDate: request.query.startDate,
      endDate: request.query.endDate,
    };

    const result = await adminService.getAllTransactions(page, limit, filters);
    return ResponseHandler.success(reply, 'Transactions fetched successfully', result);
  }

  /**
   * Update user role
   */
  async updateUserRole(
    request: FastifyRequest<{
      Params: { userId: string };
      Body: UpdateUserRoleInput;
    }>,
    reply: FastifyReply
  ) {
    const { userId } = request.params;
    const adminId = request.user!.userId;

    const updatedUser = await adminService.updateUserRole(userId, request.body, adminId);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.USER_ROLE_UPDATED, updatedUser);
  }

  /**
   * Generate report
   */
  async generateReport(
    request: FastifyRequest<{ Body: GenerateReportInput }>,
    reply: FastifyReply
  ) {
    const { reportType, startDate, endDate } = request.body;

    const report = await adminService.generateReport(reportType, startDate, endDate);
    return ResponseHandler.success(reply, 'Report generated successfully', report);
  }

  /**
   * Get pending withdrawals
   */
  async getPendingWithdrawals(request: FastifyRequest, reply: FastifyReply) {
    const result = await adminService.getPendingWithdrawals();
    return ResponseHandler.success(reply, 'Pending withdrawals fetched successfully', result);
  }

  /**
   * Process withdrawal
   */
  async processWithdrawal(
    request: FastifyRequest<{
      Params: { withdrawalId: string };
      Body: ProcessWithdrawalInput;
    }>,
    reply: FastifyReply
  ) {
    const { withdrawalId } = request.params;
    const { status, notes } = request.body;
    const adminId = request.user!.userId;

    const result = await paymentService.processWithdrawal(
      withdrawalId,
      status,
      adminId,
      notes
    );
    return ResponseHandler.success(reply, result.message, result.withdrawal);
  }

  /**
   * Get system health
   */
  async getSystemHealth(request: FastifyRequest, reply: FastifyReply) {
    const health = await adminService.getSystemHealth();
    return ResponseHandler.success(reply, 'System health fetched successfully', health);
  }
}

export const adminController = new AdminController();
