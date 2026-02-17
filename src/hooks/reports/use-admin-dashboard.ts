"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports-service";
import { AdminDashboardData } from "@/types";

export function useAdminDashboard() {
  const { data, isLoading, isError, refetch } = useQuery<AdminDashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await reportsService.getAdminDashboard();
      return response.data;
    },
    gcTime: 300_000, // 5 minutes
    retry: 1,
  });

  return {
    dashboardData: data,
    isLoading,
    isError,
    refetch,
  };
}
