import { useMutation, useQueryClient } from "@tanstack/react-query";
import { affiliateService } from "@/services/affiliate-service";
import { Affiliate, AffiliateCreate, AffiliateStatus, AffiliateUpdate } from "@workspace/types/affiliate";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export interface AffiliateFilters {
  status?: AffiliateStatus | string;
  search?: string;
  level?: string;
  certification?: string;
  partnerType?: string;
  createdFrom?: string;
  createdTo?: string;
}

export function useAffiliates(filters?: AffiliateFilters) {
  return usePagination<Affiliate>({
    endpoint: "/admin/affiliates",
    queryKey: [
      "affiliates",
      filters?.status || "all",
      filters?.search || "",
      filters?.level || "all",
      filters?.certification || "all",
      filters?.partnerType || "all",
      filters?.createdFrom || "",
      filters?.createdTo || "",
    ],
    queryParams: {
      status: filters?.status && filters.status !== "ALL" ? filters.status : undefined,
      search: filters?.search?.trim() || undefined,
      level: filters?.level && filters.level !== "ALL" ? filters.level : undefined,
      certification: filters?.certification && filters.certification !== "ALL" ? filters.certification : undefined,
      partnerType: filters?.partnerType && filters.partnerType !== "ALL" ? filters.partnerType : undefined,
      createdFrom: filters?.createdFrom || undefined,
      createdTo: filters?.createdTo || undefined,
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

export function useCreateAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AffiliateCreate) => affiliateService.createAffiliate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}

export function useUpdateAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AffiliateUpdate }) =>
      affiliateService.updateAffiliate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}

export function useDeleteAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => affiliateService.deleteAffiliate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}
