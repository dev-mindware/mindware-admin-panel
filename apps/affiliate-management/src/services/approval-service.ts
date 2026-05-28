import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { Affiliate } from "@workspace/types/affiliate";

export const approvalService = {
  listPendingAffiliates: async (page = 1, size = 10) => {
    return api.get<PaginatedResponse<Affiliate>>("/admin/approvals/pending", {
      params: { page, limit: size }
    });
  },

  approveAffiliate: async (id: string) => {
    return api.post<Affiliate>(`/admin/approvals/${id}/approve`);
  },

  rejectAffiliate: async (id: string) => {
    return api.post<Affiliate>(`/admin/approvals/${id}/reject`);
  }
};
