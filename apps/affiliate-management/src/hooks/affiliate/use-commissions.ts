import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commissionService } from "@/services/commission-service";
import { Commission, CommissionStatus } from "@workspace/types/affiliate";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export function useCommissions(filters?: {
  status?: CommissionStatus;
}) {
  return usePagination<Commission>({
    endpoint: "/admin/commissions",
    queryKey: ["commissions", String(filters?.status || "all")],
    queryParams: {
      status: filters?.status || undefined,
    },
    api,
  });
}

export function useApproveCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commissionService.approveCommission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}

export function useRejectCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notas }: { id: string; notas: string }) =>
      commissionService.rejectCommission(id, notas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}

export function usePayCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comprovativo }: { id: string; comprovativo: File }) =>
      commissionService.payCommission(id, comprovativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}
