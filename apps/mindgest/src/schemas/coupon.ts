import { z } from "zod";

export const CouponSchema = z.object({
  code: z
    .string()
    .min(3, "O código deve ter pelo menos 3 caracteres")
    .max(30, "O código deve ter no máximo 30 caracteres"),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().min(0.01, "O valor de desconto deve ser superior a 0"),
  maxUsesPerCompany: z.number().int().min(1),
  minSubscriptionMonths: z.number().int().min(1).nullable().optional(),
  applicablePlanId: z.string().nullable().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export type CouponFormData = z.infer<typeof CouponSchema>;
