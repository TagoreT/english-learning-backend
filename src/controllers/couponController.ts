import { FastifyRequest, FastifyReply } from 'fastify';
import { couponService } from '../services/couponService';
import { ResponseHandler } from '../utils/responseHandler';
import { SUCCESS_MESSAGES } from '../constants/messages';
import { CreateCouponInput, ValidateCouponInput, UpdateCouponInput } from '../validators/couponValidator';

export class CouponController {
  /**
   * Create a new coupon (Admin only)
   */
  async createCoupon(request: FastifyRequest<{ Body: CreateCouponInput }>, reply: FastifyReply) {
    const adminId = request.user!.userId;
    const coupon = await couponService.createCoupon(adminId, request.body);
    return ResponseHandler.created(reply, SUCCESS_MESSAGES.COUPON_CREATED, coupon);
  }

  /**
   * Validate a coupon code
   */
  async validateCoupon(
    request: FastifyRequest<{ Body: ValidateCouponInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId;
    const { code, amount } = request.body;

    const result = await couponService.validateCoupon(code, amount, userId);

    if (!result.valid) {
      return ResponseHandler.error(reply, result.message || 'Invalid coupon', 400);
    }

    return ResponseHandler.success(reply, result.message || 'Coupon is valid', result);
  }

  /**
   * Get all coupons (Admin only)
   */
  async getAllCoupons(
    request: FastifyRequest<{
      Querystring: {
        page?: string;
        limit?: string;
        discountType?: string;
        expired?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const page = parseInt(request.query.page || '1');
    const limit = parseInt(request.query.limit || '10');

    const filters: any = {};
    if (request.query.discountType) {
      filters.discountType = request.query.discountType;
    }
    if (request.query.expired !== undefined) {
      filters.expired = request.query.expired === 'true';
    }

    const result = await couponService.getAllCoupons(page, limit, filters);
    return ResponseHandler.success(reply, 'Coupons fetched successfully', result);
  }

  /**
   * Get coupon by code (Admin only)
   */
  async getCouponByCode(
    request: FastifyRequest<{ Params: { code: string } }>,
    reply: FastifyReply
  ) {
    const { code } = request.params;
    const coupon = await couponService.getCouponByCode(code);
    return ResponseHandler.success(reply, 'Coupon fetched successfully', coupon);
  }

  /**
   * Update coupon (Admin only)
   */
  async updateCoupon(
    request: FastifyRequest<{ Params: { code: string }; Body: UpdateCouponInput }>,
    reply: FastifyReply
  ) {
    const { code } = request.params;
    const adminId = request.user!.userId;

    const updatedCoupon = await couponService.updateCoupon(code, request.body, adminId);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.COUPON_UPDATED, updatedCoupon);
  }

  /**
   * Delete coupon (Admin only)
   */
  async deleteCoupon(
    request: FastifyRequest<{ Params: { code: string } }>,
    reply: FastifyReply
  ) {
    const { code } = request.params;
    const adminId = request.user!.userId;

    const result = await couponService.deleteCoupon(code, adminId);
    return ResponseHandler.success(reply, SUCCESS_MESSAGES.COUPON_DELETED, result);
  }

  /**
   * Get coupon statistics (Admin only)
   */
  async getCouponStats(
    request: FastifyRequest<{ Params: { code: string } }>,
    reply: FastifyReply
  ) {
    const { code } = request.params;
    const stats = await couponService.getCouponStats(code);
    return ResponseHandler.success(reply, 'Coupon stats fetched successfully', stats);
  }
}

export const couponController = new CouponController();
