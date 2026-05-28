import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import {
  PartnerProgramPlan,
  PartnerSubscription,
  SubscriptionPaymentCreate,
  SubscriptionStatusUpdate,
} from "@workspace/types/affiliate";

export const partnerProgramService = {
  listPlans: async () => {
    return api.get<PartnerProgramPlan[]>("/admin/partner-program/plans");
  },

  createPlan: async (data: Partial<PartnerProgramPlan>) => {
    return api.post<PartnerProgramPlan>("/admin/partner-program/plans", data);
  },

  registerSubscriptionPayment: async (data: SubscriptionPaymentCreate) => {
    return api.post("/admin/partner-program/subscription-payments", data);
  },

  listSubscriptions: async (filters?: {
    status?: string;
    affiliateId?: string;
    planCode?: string;
    billingPeriod?: string;
    source?: string;
    page?: number;
    limit?: number;
  }) => {
    return api.get<PaginatedResponse<PartnerSubscription>>("/admin/partner-program/subscriptions", {
      params: filters,
    });
  },

  updateSubscriptionStatus: async (id: string, data: SubscriptionStatusUpdate) => {
    return api.patch<PartnerSubscription>(`/admin/partner-program/subscriptions/${id}/status`, data);
  },

  releaseValidatedCommissions: async () => {
    return api.post<{ released: number }>("/admin/partner-program/commissions/release-validated");
  },

  getAffiliateProgramSummary: async (affiliateId: string) => {
    return api.get(`/admin/partner-program/affiliates/${affiliateId}/program-summary`);
  },

  approveCertification: async (affiliateId: string, notes?: string) => {
    return api.post(`/admin/partner-program/affiliates/${affiliateId}/certification/approve`, { notes });
  },

  rejectCertification: async (affiliateId: string, notes?: string) => {
    return api.post(`/admin/partner-program/affiliates/${affiliateId}/certification/reject`, { notes });
  },
};
