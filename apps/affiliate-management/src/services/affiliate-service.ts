import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { Affiliate, AffiliateCreate, AffiliateStatus, AffiliateUpdate } from "@workspace/types/affiliate";

export interface MindgestReferredClient {
  id: string;
  name: string;
  tax_number: string;
  email: string;
  phone: string;
  affiliate_code: string;
  company_name: string;
  company_tax_number: string;
  company_email: string;
  subscription_status: string;
  current_plan: string;
}

export interface MindgestClientsResponse {
  data: MindgestReferredClient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const affiliateService = {
  listAffiliates: async (status?: AffiliateStatus, page = 1, size = 10) => {
    return api.get<PaginatedResponse<Affiliate>>("/admin/affiliates", {
      params: { status, page, limit: size }
    });
  },
  
  getAffiliateDetails: async (id: string) => {
    return api.get<Affiliate>(`/admin/affiliates/${id}`);
  },

  listMindgestClients: async (
    affiliateId: string,
    filters?: {
      search?: string;
      page?: number;
      limit?: number;
      status?: string;
      plan?: string;
    },
  ) => {
    return api.get<MindgestClientsResponse>(`/admin/affiliates/${affiliateId}/mindgest-clients`, {
      params: filters,
    });
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
