"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics-service";

export function useAnalytics(months = 12) {
  return useQuery({ queryKey: ["analytics", months], queryFn: () => analyticsService.overview(months), staleTime: 60_000, refetchInterval: 120_000, retry: false });
}
