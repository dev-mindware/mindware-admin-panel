import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commissionService } from "@/services/commission-service";
import { Commission, CommissionStatus } from "@workspace/types/affiliate";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export interface CommissionFilters {
  status?: CommissionStatus | string;
  search?: string;
  source?: string;
  createdFrom?: string;
  createdTo?: string;
}

export function useCommissions(filters?: CommissionFilters) {
  return usePagination<Commission>({
    endpoint: "/admin/commissions",
    queryKey: [
      "commissions",
      filters?.status || "all",
      filters?.search || "",
      filters?.source || "all",
      filters?.createdFrom || "",
      filters?.createdTo || "",
    ],
    queryParams: {
      status: filters?.status && filters.status !== "ALL" ? filters.status : undefined,
      search: filters?.search?.trim() || undefined,
      source: filters?.source && filters.source !== "ALL" ? filters.source : undefined,
      createdFrom: filters?.createdFrom || undefined,
      createdTo: filters?.createdTo || undefined,
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
