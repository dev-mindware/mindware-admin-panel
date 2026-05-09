import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { Commission, CommissionStatus, CommissionCreate } from "@workspace/types/affiliate";

export const commissionService = {
  listCommissions: async (status?: CommissionStatus, page = 1, size = 10) => {
    return api.get<PaginatedResponse<Commission>>("/admin/commissions", {
      params: { status, page, size }
    });
  },

  registerSale: async (data: CommissionCreate) => {
    return api.post<Commission>("/admin/commissions", data);
  },

  approveCommission: async (id: string) => {
    return api.post<Commission>(`/admin/commissions/${id}/approve`);
  },

  rejectCommission: async (id: string, notas: string) => {
    // Backend expects notas as form data
    const formData = new FormData();
    formData.append("notas", notas);
    return api.post<Commission>(`/admin/commissions/${id}/reject`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  payCommission: async (id: string, comprovativo: File) => {
    const formData = new FormData();
    formData.append("comprovativo", comprovativo);
    return api.post<Commission>(`/admin/commissions/${id}/pay`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};
