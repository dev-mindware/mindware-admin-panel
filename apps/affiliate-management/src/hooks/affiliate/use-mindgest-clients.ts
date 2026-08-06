import { useQuery } from "@tanstack/react-query";
import { affiliateService, type MindgestReferredClient } from "@/services/affiliate-service";

export function useMindgestClientsByAffiliate(
  affiliateId?: string,
  filters?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: string;
    plan?: string;
  },
) {
  return useQuery({
    queryKey: ["mindgest-clients", affiliateId, filters],
    enabled: !!affiliateId,
    queryFn: async (): Promise<MindgestReferredClient[]> => {
      const response = await affiliateService.listMindgestClients(affiliateId as string, {
        limit: 100,
        ...filters,
      });
      const body = response.data as any;
      if (Array.isArray(body)) return body;
      if (Array.isArray(body?.data)) return body.data;
      if (Array.isArray(body?.items)) return body.items;
      return [];
    },
  });
}
