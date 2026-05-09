import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawalService } from "@/services/withdrawal-service";
import { WithdrawalRequest, WithdrawalStatus } from "@workspace/types/affiliate";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export function useWithdrawalRequests(filters?: {
  status?: WithdrawalStatus;
}) {
  return usePagination<WithdrawalRequest>({
    endpoint: "/admin/withdrawals",
    queryKey: ["withdrawals", String(filters?.status || "all")],
    queryParams: {
      status: filters?.status || undefined,
    },
    api,
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
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
