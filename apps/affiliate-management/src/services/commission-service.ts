import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { Commission, CommissionStatus, CommissionCreate } from "@workspace/types/affiliate";

export const commissionService = {
  listCommissions: async (status?: CommissionStatus, page = 1, size = 10) => {
    return api.get<PaginatedResponse<Commission>>("/admin/commissions", {
      params: { status, page, limit: size }
    });
  },

  registerSale: async (data: CommissionCreate) => {
    return api.post<Commission>("/admin/commissions", data);
  },

  approveCommission: async (id: string) => {
    return api.post<Commission>(`/admin/commissions/${id}/approve`);
  },

  rejectCommission: async (id: string, notas: string) => {
    return api.post<Commission>(`/admin/commissions/${id}/reject`, { notas });
  },

  payCommission: async (id: string, comprovativo: File) => {
    const formData = new FormData();
    formData.append("comprovativo", comprovativo);
    return api.post<Commission>(`/admin/commissions/${id}/pay`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};
