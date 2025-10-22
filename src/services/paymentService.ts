import { prisma } from '../config/database';
import { TransactionType, TransactionStatus, WithdrawalStatus } from '@prisma/client';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

interface PaymentGatewayResponse {
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: any;
}

class PaymentService {
  /**
   * Add money to user's wallet
   * @param userId User ID
   * @param amount Amount to add
   * @param paymentMethod Payment method (stripe, razorpay, etc)
   */
  async addMoneyToWallet(userId: string, amount: number, paymentMethod: string) {
    // Validate amount
    if (amount <= 0) {
      throw new AppError('Amount must be positive', 400);
    }

    // Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: TransactionType.WALLET_TOPUP,
        status: TransactionStatus.PENDING,
        metadata: {
          paymentMethod,
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    // In production, this would initiate payment with Stripe/Razorpay
    // For now, we'll simulate a payment session
    const paymentSession = {
      transactionId: transaction.id,
      amount,
      currency: 'INR',
      paymentMethod,
      sessionUrl: `${env.FRONTEND_URL}/payment/checkout/${transaction.id}`,
      // In real implementation:
      // - For Stripe: stripe.checkout.sessions.create()
      // - For Razorpay: razorpay.orders.create()
    };

    return {
      transaction,
      paymentSession,
      message: 'Payment session created. Please complete the payment.',
    };
  }

  /**
   * Verify and complete payment (webhook handler)
   * @param transactionId Transaction ID
   * @param gatewayResponse Response from payment gateway
   */
  async verifyPayment(transactionId: string, gatewayResponse: PaymentGatewayResponse) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new AppError('Transaction already processed', 400);
    }

    // Verify payment signature/status with gateway
    // In production: verify signature from Stripe/Razorpay webhook
    const isValid = this.verifyPaymentSignature(gatewayResponse);

    if (!isValid) {
      // Mark transaction as failed
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.FAILED,
          metadata: {
            ...(transaction.metadata as object),
            failedAt: new Date().toISOString(),
            gatewayResponse,
          },
        },
      });

      throw new AppError('Payment verification failed', 400);
    }

    // Update transaction and wallet balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.COMPLETED,
          gatewayTransactionId: gatewayResponse.transactionId,
          metadata: {
            ...(transaction.metadata as object),
            completedAt: new Date().toISOString(),
            gatewayResponse,
          },
        },
      });

      // Update user wallet balance
      const updatedUser = await tx.user.update({
        where: { id: transaction.userId },
        data: {
          walletBalance: {
            increment: transaction.amount,
          },
        },
      });

      return { transaction: updatedTransaction, user: updatedUser };
    });

    return {
      success: true,
      transaction: result.transaction,
      newBalance: result.user.walletBalance,
    };
  }

  /**
   * Request withdrawal from wallet
   * @param userId User ID
   * @param amount Amount to withdraw
   */
  async requestWithdrawal(userId: string, amount: number) {
    if (amount <= 0) {
      throw new AppError('Withdrawal amount must be positive', 400);
    }

    // Get user with current balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user has sufficient balance
    if (user.walletBalance < amount) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    // Check minimum withdrawal amount
    const MIN_WITHDRAWAL = 100; // Configurable
    if (amount < MIN_WITHDRAWAL) {
      throw new AppError(`Minimum withdrawal amount is ${MIN_WITHDRAWAL}`, 400);
    }

    // Create withdrawal request in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct amount from wallet (hold it)
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            decrement: amount,
          },
        },
      });

      // Create withdrawal record
      const withdrawal = await tx.walletWithdrawal.create({
        data: {
          userId,
          amount,
          status: WithdrawalStatus.PENDING,
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: -amount, // Negative for withdrawal
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.PENDING,
          metadata: {
            withdrawalId: withdrawal.id,
            requestedAt: new Date().toISOString(),
          },
        },
      });

      return { withdrawal, transaction };
    });

    return {
      withdrawal: result.withdrawal,
      message: 'Withdrawal request submitted. It will be processed within 3-5 business days.',
    };
  }

  /**
   * Get payment history for user
   * @param userId User ID
   * @param page Page number
   * @param limit Items per page
   */
  async getPaymentHistory(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { userId },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Process withdrawal (Admin only)
   * @param withdrawalId Withdrawal ID
   * @param status Approval status
   * @param adminId Admin user ID
   * @param notes Admin notes
   */
  async processWithdrawal(
    withdrawalId: string,
    status: 'APPROVED' | 'REJECTED',
    adminId: string,
    notes?: string
  ) {
    const withdrawal = await prisma.walletWithdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      throw new AppError('Withdrawal request not found', 404);
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new AppError('Withdrawal already processed', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update withdrawal status
      const updatedWithdrawal = await tx.walletWithdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: status === 'APPROVED' ? WithdrawalStatus.COMPLETED : WithdrawalStatus.REJECTED,
          processedAt: new Date(),
        },
      });

      // Find associated transaction
      const transaction = await tx.transaction.findFirst({
        where: {
          userId: withdrawal.userId,
          metadata: {
            path: ['withdrawalId'],
            equals: withdrawalId,
          },
        },
      });

      if (transaction) {
        // Update transaction status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: status === 'APPROVED' ? TransactionStatus.COMPLETED : TransactionStatus.FAILED,
            metadata: {
              ...(transaction.metadata as object),
              processedBy: adminId,
              processedAt: new Date().toISOString(),
              notes,
            },
          },
        });
      }

      // If rejected, refund the amount to wallet
      if (status === 'REJECTED') {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            walletBalance: {
              increment: withdrawal.amount,
            },
          },
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: `WITHDRAWAL_${status}`,
          entityType: 'WITHDRAWAL',
          entityId: withdrawalId,
          payload: {
            withdrawalId,
            amount: withdrawal.amount,
            status,
            notes,
          },
        },
      });

      return updatedWithdrawal;
    });

    return {
      withdrawal: result,
      message: `Withdrawal ${status.toLowerCase()} successfully`,
    };
  }

  /**
   * Get wallet balance
   * @param userId User ID
   */
  async getWalletBalance(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletBalance: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      balance: user.walletBalance,
      currency: 'INR',
    };
  }

  /**
   * Deduct from wallet (for purchases)
   * @param userId User ID
   * @param amount Amount to deduct
   * @param type Transaction type
   * @param metadata Additional metadata
   */
  async deductFromWallet(
    userId: string,
    amount: number,
    type: TransactionType,
    metadata?: any
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.walletBalance < amount) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            decrement: amount,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: -amount,
          type,
          status: TransactionStatus.COMPLETED,
          metadata: {
            ...metadata,
            completedAt: new Date().toISOString(),
          },
        },
      });

      return { user: updatedUser, transaction };
    });

    return result;
  }

  /**
   * Verify payment signature from gateway
   * In production, implement actual verification logic for Stripe/Razorpay
   */
  private verifyPaymentSignature(gatewayResponse: PaymentGatewayResponse): boolean {
    // TODO: Implement actual signature verification
    // For Stripe: verify webhook signature
    // For Razorpay: verify payment signature using crypto

    // For now, simulate verification
    return gatewayResponse.status === 'success' || gatewayResponse.status === 'completed';
  }
}

export const paymentService = new PaymentService();
