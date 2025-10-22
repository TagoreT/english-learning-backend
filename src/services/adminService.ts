import { prisma } from '../config/database';
import { UserRole, TransactionType, SubscriptionStatus } from '@prisma/client';
import { AppError } from '../utils/errors';
import { UpdateUserRoleInput } from '../validators/adminValidator';

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalCourses,
      totalRevenue,
      activeSubscriptions,
      pendingWithdrawals,
      recentTransactions,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total courses
      prisma.course.count({ where: { isPublished: true } }),

      // Total revenue
      prisma.transaction.aggregate({
        where: {
          type: {
            in: [TransactionType.COURSE_PURCHASE, TransactionType.SUBSCRIPTION, TransactionType.WALLET_TOPUP],
          },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),

      // Active subscriptions
      prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),

      // Pending withdrawals
      prisma.walletWithdrawal.count({
        where: { status: 'PENDING' },
      }),

      // Recent transactions (last 10)
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // User growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Revenue by type
    const revenueByType = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        status: 'COMPLETED',
        type: {
          in: [TransactionType.COURSE_PURCHASE, TransactionType.SUBSCRIPTION, TransactionType.WALLET_TOPUP],
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      overview: {
        totalUsers,
        totalCourses,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeSubscriptions,
        pendingWithdrawals,
        newUsersLast30Days,
      },
      revenueByType: revenueByType.map((r) => ({
        type: r.type,
        total: r._sum.amount || 0,
      })),
      recentTransactions,
    };
  }

  /**
   * Get all transactions with filters
   */
  async getAllTransactions(
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: TransactionType;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
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
   * Update user role
   */
  async updateUserRole(userId: string, data: UpdateUserRoleInput, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent changing superadmin role
    if (user.role === UserRole.SUPERADMIN && data.role !== UserRole.SUPERADMIN) {
      throw new AppError('Cannot change superadmin role', 403);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: data.role },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'USER_ROLE_UPDATED',
        entityType: 'USER',
        entityId: userId,
        payload: {
          userId,
          oldRole: user.role,
          newRole: data.role,
        },
      },
    });

    return updatedUser;
  }

  /**
   * Generate report
   */
  async generateReport(
    reportType: 'USERS' | 'COURSES' | 'REVENUE' | 'SUBSCRIPTIONS' | 'TRANSACTIONS',
    startDate?: string,
    endDate?: string
  ) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    let reportData: any;

    switch (reportType) {
      case 'USERS':
        reportData = await prisma.user.findMany({
          where: startDate || endDate ? { createdAt: dateFilter } : {},
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            walletBalance: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      case 'COURSES':
        reportData = await prisma.course.findMany({
          where: startDate || endDate ? { createdAt: dateFilter } : {},
          include: {
            instructor: {
              select: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
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
        });
        break;

      case 'REVENUE':
        reportData = await prisma.transaction.findMany({
          where: {
            ...(startDate || endDate ? { createdAt: dateFilter } : {}),
            type: {
              in: [TransactionType.COURSE_PURCHASE, TransactionType.SUBSCRIPTION, TransactionType.WALLET_TOPUP],
            },
            status: 'COMPLETED',
          },
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      case 'SUBSCRIPTIONS':
        reportData = await prisma.subscription.findMany({
          where: startDate || endDate ? { startDate: dateFilter } : {},
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
            plan: true,
          },
          orderBy: { startDate: 'desc' },
        });
        break;

      case 'TRANSACTIONS':
        reportData = await prisma.transaction.findMany({
          where: startDate || endDate ? { createdAt: dateFilter } : {},
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      default:
        throw new AppError('Invalid report type', 400);
    }

    return {
      reportType,
      generatedAt: new Date().toISOString(),
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      data: reportData,
      totalRecords: reportData.length,
    };
  }

  /**
   * Get all pending withdrawals
   */
  async getPendingWithdrawals() {
    const withdrawals = await prisma.walletWithdrawal.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            walletBalance: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      withdrawals,
      count: withdrawals.length,
      totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
    };
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth() {
    const [databaseSize, totalAuditLogs, errorCount] = await Promise.all([
      // Get total record counts as a proxy for database size
      Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.transaction.count(),
        prisma.subscription.count(),
      ]).then((counts) => counts.reduce((a, b) => a + b, 0)),

      // Total audit logs
      prisma.auditLog.count(),

      // Failed transactions in last 24 hours
      prisma.transaction.count({
        where: {
          status: 'FAILED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      database: {
        totalRecords: databaseSize,
        status: 'healthy',
      },
      auditLogs: {
        total: totalAuditLogs,
        status: 'healthy',
      },
      errors: {
        last24Hours: errorCount,
        status: errorCount > 100 ? 'warning' : 'healthy',
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}

export const adminService = new AdminService();
