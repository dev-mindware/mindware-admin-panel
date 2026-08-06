import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { Affiliate, AffiliateCreate, AffiliateStatus, AffiliateUpdate } from "@workspace/types/affiliate";

export const affiliateService = {
  listAffiliates: async (status?: AffiliateStatus, page = 1, size = 10) => {
    return api.get<PaginatedResponse<Affiliate>>("/admin/affiliates", {
      params: { status, page, limit: size }
    });
  },
  
  getAffiliateDetails: async (id: string) => {
    return api.get<Affiliate>(`/admin/affiliates/${id}`);
  },

  createAffiliate: async (data: AffiliateCreate) => {
    return api.post<Affiliate>("/admin/affiliates", data);
  },

  updateAffiliate: async (id: string, data: AffiliateUpdate) => {
    return api.patch<Affiliate>(`/admin/affiliates/${id}`, data);
  },

  updateAffiliateStatus: async (id: string, status: AffiliateStatus) => {
    return api.patch<Affiliate>(`/admin/affiliates/${id}/status`, { status });
  },

  approveAffiliate: async (id: string) => {
    return api.post<Affiliate>(`/admin/approvals/${id}/approve`);
  },

  deleteAffiliate: async (id: string) => {
    return api.delete<{ deleted: boolean; id: string }>(`/admin/affiliates/${id}`);
  },
};
