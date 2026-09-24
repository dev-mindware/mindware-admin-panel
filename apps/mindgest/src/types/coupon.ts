export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number | string;
  maxUses: number | null;
  currentUses: number;
  maxUsesPerCompany: number;
  minSubscriptionMonths: number | null;
  applicablePlanId: string | null;
  applicablePlan?: {
    id: string;
    name: string;
    price?: number | string;
  } | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    usages: number;
  };
}

export interface CouponCreateInput {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxUsesPerCompany?: number;
  minSubscriptionMonths?: number | null;
  applicablePlanId?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUsages: number;
  totalDiscountAmount: number;
}

export interface CouponFilterParams {
  search?: string;
  isActive?: boolean;
  discountType?: DiscountType;
  page?: number;
  limit?: number;
}

export interface CouponListResponse {
  data: Coupon[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
