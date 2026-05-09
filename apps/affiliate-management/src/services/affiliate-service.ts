import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { Affiliate, AffiliateStatus, AffiliateUpdate } from "@workspace/types/affiliate";

export const affiliateService = {
  listAffiliates: async (status?: AffiliateStatus, page = 1, size = 10) => {
    return api.get<PaginatedResponse<Affiliate>>("/admin/affiliates", {
      params: { status, page, size }
    });
  },
  
  getAffiliateDetails: async (id: string) => {
    return api.get<Affiliate>(`/admin/affiliates/${id}`);
  },

  updateAffiliateStatus: async (id: string, status: AffiliateStatus) => {
    return api.patch<Affiliate>(`/admin/affiliates/${id}/status`, { status });
  },

  approveAffiliate: async (id: string) => {
    return api.post<Affiliate>(`/admin/affiliates/${id}/approve`);
  }
};
