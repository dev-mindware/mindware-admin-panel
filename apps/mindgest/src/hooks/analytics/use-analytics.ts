import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics-service";

export function useExecutiveMetrics(timeRange?: string) {
  return useQuery({
    queryKey: ["analytics-executive", timeRange],
    queryFn: () => analyticsService.getExecutiveMetrics(timeRange),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useTrendAnalytics() {
  return useQuery({
    queryKey: ["analytics-trend"],
    queryFn: analyticsService.getTrendAnalytics,
    staleTime: 1000 * 60 * 5,
  });
}



export function useProductAnalytics() {
  return useQuery({
    queryKey: ["analytics-product"],
    queryFn: analyticsService.getProductAnalytics,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMarketingAnalytics() {
  return useQuery({
    queryKey: ["analytics-marketing"],
    queryFn: analyticsService.getMarketingAnalytics,
    staleTime: 1000 * 60 * 5,
  });
}

export function useHealthScores(page = 1, limit = 10, status?: string, search?: string) {
  return useQuery({
    queryKey: ["analytics-health-scores", page, limit, status, search],
    queryFn: () => analyticsService.getHealthScores(page, limit, status, search),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSystemAlerts(unreadOnly = false) {
  return useQuery({
    queryKey: ["analytics-system-alerts", unreadOnly],
    queryFn: () => analyticsService.getSystemAlerts(unreadOnly),
    refetchInterval: 30000, // Poll every 30s for real-time alerts
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyticsService.markAlertRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-system-alerts"] });
    },
  });
}

export function useApplicationLogs(page = 1, limit = 10, level?: string, search?: string) {
  return useQuery({
    queryKey: ["analytics-application-logs", page, limit, level, search],
    queryFn: () => analyticsService.getApplicationLogs(page, limit, level, search),
    refetchInterval: 15000,
  });
}

export function useAuditTrails(page = 1, limit = 10, entity?: string, action?: string, search?: string) {
  return useQuery({
    queryKey: ["analytics-audit-trails", page, limit, entity, action, search],
    queryFn: () => analyticsService.getAuditTrails(page, limit, entity, action, search),
    refetchInterval: 15000,
  });
}


