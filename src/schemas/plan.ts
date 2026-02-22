import { z } from "zod";

export const PlanSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  priceMonthly: z.number().min(0, "O preço deve ser superior ou igual a 0"),
  isPublic: z.boolean(),
  maxUsers: z.number().int().min(1, "Deve haver pelo menos 1 utilizador"),
  maxStores: z.number().int().min(-1, "Use -1 para lojas ilimitadas"),
  trialPeriodInDays: z.number().int().nullable(),
  billingIntervals: z.array(z.string()),
  features: z.object({
    hasPos: z.boolean(),
    canExportSaft: z.boolean(),
    hasStock: z.boolean(),
    hasInvoices: z.boolean(),
    hasReporting: z.boolean(),
    hasSuppliers: z.boolean(),
    hasAppearance: z.boolean(),
    hasPrintFormats: z.boolean(),
  }),
});

export type PlanFormData = z.infer<typeof PlanSchema>;
