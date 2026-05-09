import { useMutation, useQueryClient } from "@tanstack/react-query";
import { affiliateService } from "@/services/affiliate-service";
import { Affiliate, AffiliateStatus } from "@workspace/types/affiliate";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export function useAffiliates(filters?: {
  status?: AffiliateStatus;
}) {
  return usePagination<Affiliate>({
    endpoint: "/admin/affiliates",
    queryKey: ["affiliates", String(filters?.status || "all")],
    queryParams: {
      status: filters?.status || undefined,
    },
    api,
  });
}

export function useUpdateAffiliateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AffiliateStatus }) =>
      affiliateService.updateAffiliateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}

