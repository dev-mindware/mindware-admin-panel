import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { WithdrawalRequest, WithdrawalStatus } from "@workspace/types/affiliate";

export const withdrawalService = {
  listWithdrawals: async (status?: WithdrawalStatus, page = 1, size = 10) => {
    return api.get<PaginatedResponse<WithdrawalRequest>>("/admin/withdrawals", {
      params: { status, page, limit: size }
    });
  },

  approveWithdrawal: async (id: string, _file?: File) => {
    return api.post<WithdrawalRequest>(`/admin/withdrawals/${id}/approve`);
  },

  rejectWithdrawal: async (id: string, notas_admin: string) => {
    return api.post<WithdrawalRequest>(`/admin/withdrawals/${id}/reject`, { notas_admin });
  }
};
