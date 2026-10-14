import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawalService } from "@/services/withdrawal-service";
import { WithdrawalRequest, WithdrawalStatus } from "@workspace/types/affiliate";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export interface WithdrawalFilters {
  status?: WithdrawalStatus | string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
}

export function useWithdrawalRequests(filters?: WithdrawalFilters) {
  return usePagination<WithdrawalRequest>({
    endpoint: "/admin/withdrawals",
    queryKey: [
      "withdrawals",
      filters?.status || "all",
      filters?.search || "",
      filters?.createdFrom || "",
      filters?.createdTo || "",
    ],
    queryParams: {
      status: filters?.status && filters.status !== "ALL" ? filters.status : undefined,
      search: filters?.search?.trim() || undefined,
      createdFrom: filters?.createdFrom || undefined,
      createdTo: filters?.createdTo || undefined,
    },
    api,
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file?: File }) =>
      withdrawalService.approveWithdrawal(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notas }: { id: string; notas: string }) =>
      withdrawalService.rejectWithdrawal(id, notas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });
}
