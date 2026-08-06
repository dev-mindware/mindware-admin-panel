import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { Lead, LeadStatus } from "@workspace/types/affiliate";

export const leadService = {
  listLeads: async (status?: LeadStatus, page = 1, size = 10) => {
    return api.get<PaginatedResponse<Lead>>("/admin/leads", {
      params: { status, page, limit: size }
    });
  },

  updateLeadStatus: async (id: string, status: LeadStatus) => {
    return api.patch<Lead>(`/admin/leads/${id}/status`, { status });
  }
};
