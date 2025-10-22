import { FastifyRequest, FastifyReply } from 'fastify';
import { paymentService } from '../services/paymentService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';

export class PaymentController {
  async addMoney(request: FastifyRequest<{ Body: { amount: number; paymentMethod: string } }>, reply: FastifyReply) {
    const userId = request.user!.userId;
    const result = await paymentService.addMoneyToWallet(userId, request.body.amount, request.body.paymentMethod);
    return ResponseHandler.created(reply, SUCCESS_MESSAGES.PAYMENT_SUCCESS, result);
  }

  async requestWithdrawal(request: FastifyRequest<{ Body: { amount: number } }>, reply: FastifyReply) {
    const userId = request.user!.userId;
    const withdrawal = await paymentService.requestWithdrawal(userId, request.body.amount);
    return ResponseHandler.created(reply, SUCCESS_MESSAGES.WITHDRAWAL_REQUESTED, withdrawal);
  }

  async getPaymentHistory(request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>, reply: FastifyReply) {
    const userId = request.user!.userId;
    const page = parseInt(request.query.page || '1');
    const limit = parseInt(request.query.limit || '10');
    const history = await paymentService.getPaymentHistory(userId, page, limit);
    return ResponseHandler.success(reply, 'Payment history fetched', history);
  }

  async verifyPayment(request: FastifyRequest<{ Body: { transactionId: string; gatewayResponse: any } }>, reply: FastifyReply) {
    const result = await paymentService.verifyPayment(request.body.transactionId, request.body.gatewayResponse);
    return ResponseHandler.success(reply, 'Payment verified', result);
  }
}

export const paymentController = new PaymentController();
