import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard-service";

export function useDashboardKPIs() {
    return useQuery({
        queryKey: ["dashboard", "kpis"],
        queryFn: async () => {
            const response = await dashboardService.getKPIs();
            return response.data;
        },
    });
}
