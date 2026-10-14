import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { WithdrawalRequest, WithdrawalStatus } from "@workspace/types/affiliate";

export const withdrawalService = {
  listWithdrawals: async (params?: { status?: string; search?: string; affiliateId?: string; createdFrom?: string; createdTo?: string; page?: number; limit?: number }) => {
    return api.get<PaginatedResponse<WithdrawalRequest>>("/admin/withdrawals", {
      params,
    });
  },

  approveWithdrawal: async (id: string, file?: File) => {
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      return api.post<WithdrawalRequest>(`/admin/withdrawals/${id}/approve`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.post<WithdrawalRequest>(`/admin/withdrawals/${id}/approve`);
  },

  rejectWithdrawal: async (id: string, notas_admin: string) => {
    return api.post<WithdrawalRequest>(`/admin/withdrawals/${id}/reject`, { notas_admin });
  }
};
