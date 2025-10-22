import { prisma } from '../config/database';
import { DiscountType } from '@prisma/client';
import { AppError } from '../utils/errors';
import { CreateCouponInput, UpdateCouponInput } from '../validators/couponValidator';

interface CouponValidationResult {
  valid: boolean;
  coupon?: any;
  discount?: number;
  finalAmount?: number;
  message?: string;
}

class CouponService {
  /**
   * Create a new coupon (Admin only)
   * @param adminId Admin user ID
   * @param data Coupon data
   */
  async createCoupon(adminId: string, data: CreateCouponInput) {
    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      throw new AppError('Coupon code already exists', 400);
    }

    // Validate discount value
    if (data.discountType === DiscountType.PERCENTAGE && data.value > 100) {
      throw new AppError('Percentage discount cannot exceed 100%', 400);
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        discountType: data.discountType as DiscountType,
        value: data.value,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        usageLimit: data.usageLimit || null,
        multiTier: data.multiTier || null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'COUPON_CREATED',
        entityType: 'COUPON',
        entityId: coupon.id,
        payload: {
          code: coupon.code,
          discountType: coupon.discountType,
          value: coupon.value,
        },
      },
    });

    return coupon;
  }

  /**
   * Validate and calculate discount for a coupon
   * @param code Coupon code
   * @param amount Original amount
   * @param userId User ID (optional, for usage tracking)
   */
  async validateCoupon(
    code: string,
    amount: number,
    userId?: string
  ): Promise<CouponValidationResult> {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    // Check if coupon exists
    if (!coupon) {
      return {
        valid: false,
        message: 'Invalid coupon code',
      };
    }

    // Check if coupon is expired
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return {
        valid: false,
        message: 'Coupon has expired',
      };
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        message: 'Coupon usage limit reached',
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discount = (amount * coupon.value) / 100;
    } else if (coupon.discountType === DiscountType.FIXED) {
      discount = coupon.value;
    }

    // Ensure discount doesn't exceed amount
    discount = Math.min(discount, amount);

    const finalAmount = Math.max(0, amount - discount);

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
      },
      discount,
      finalAmount,
      message: 'Coupon applied successfully',
    };
  }

  /**
   * Apply coupon and increment usage count
   * This should be called after payment is confirmed
   * @param code Coupon code
   * @param userId User ID
   */
  async applyCoupon(code: string, userId: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new AppError('Invalid coupon code', 400);
    }

    // Increment usage count
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'COUPON_USED',
        entityType: 'COUPON',
        entityId: coupon.id,
        payload: {
          code: coupon.code,
          usedBy: userId,
        },
      },
    });

    return {
      applied: true,
      coupon,
    };
  }

  /**
   * Get all coupons (Admin only)
   * @param page Page number
   * @param limit Items per page
   * @param filters Filters
   */
  async getAllCoupons(
    page: number = 1,
    limit: number = 10,
    filters?: {
      active?: boolean;
      expired?: boolean;
      discountType?: DiscountType;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Apply filters
    if (filters?.discountType) {
      where.discountType = filters.discountType;
    }

    if (filters?.expired !== undefined) {
      if (filters.expired) {
        where.expiresAt = { lt: new Date() };
      } else {
        where.OR = [{ expiresAt: null }, { expiresAt: { gte: new Date() } }];
      }
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return {
      coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get coupon by code (Admin only)
   * @param code Coupon code
   */
  async getCouponByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    return coupon;
  }

  /**
   * Update coupon (Admin only)
   * @param code Coupon code
   * @param data Update data
   * @param adminId Admin user ID
   */
  async updateCoupon(code: string, data: UpdateCouponInput, adminId: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: {
        usageLimit: data.usageLimit,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'COUPON_UPDATED',
        entityType: 'COUPON',
        entityId: coupon.id,
        payload: {
          code: coupon.code,
          updates: data,
        },
      },
    });

    return updatedCoupon;
  }

  /**
   * Delete coupon (Admin only)
   * @param code Coupon code
   * @param adminId Admin user ID
   */
  async deleteCoupon(code: string, adminId: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    await prisma.coupon.delete({
      where: { code: code.toUpperCase() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'COUPON_DELETED',
        entityType: 'COUPON',
        entityId: coupon.id,
        payload: {
          code: coupon.code,
        },
      },
    });

    return {
      deleted: true,
      coupon,
    };
  }

  /**
   * Get coupon usage statistics (Admin only)
   * @param code Coupon code
   */
  async getCouponStats(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    // Calculate stats
    const isExpired = coupon.expiresAt ? new Date() > coupon.expiresAt : false;
    const isUsageLimitReached =
      coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
    const remainingUses =
      coupon.usageLimit !== null ? Math.max(0, coupon.usageLimit - coupon.usedCount) : null;

    return {
      coupon,
      stats: {
        usedCount: coupon.usedCount,
        usageLimit: coupon.usageLimit,
        remainingUses,
        isExpired,
        isUsageLimitReached,
        isActive: !isExpired && !isUsageLimitReached,
      },
    };
  }
}

export const couponService = new CouponService();
