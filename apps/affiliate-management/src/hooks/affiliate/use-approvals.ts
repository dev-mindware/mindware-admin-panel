import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalService } from "@/services/approval-service";
import { Affiliate } from "@workspace/types/affiliate";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export function usePendingAffiliates() {
  return usePagination<Affiliate>({
    endpoint: "/admin/approvals/pending",
    queryKey: "pending-affiliates",
    api,
  });
}

export function useApproveAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approvalService.approveAffiliate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}

export function useRejectAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approvalService.rejectAffiliate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}
