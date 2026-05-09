import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { WithdrawalRequest, WithdrawalStatus } from "@workspace/types/affiliate";

export const withdrawalService = {
  listWithdrawals: async (status?: WithdrawalStatus, page = 1, size = 10) => {
    return api.get<PaginatedResponse<WithdrawalRequest>>("/admin/withdrawals", {
      params: { status, page, size }
    });
  },

  approveWithdrawal: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<WithdrawalRequest>(`/admin/withdrawals/${id}/approve`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  rejectWithdrawal: async (id: string, notas_admin: string) => {
    const formData = new FormData();
    formData.append("notas_admin", notas_admin);
    return api.post<WithdrawalRequest>(`/admin/withdrawals/${id}/reject`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};
