import type { AdminDashboardData } from "@/types";
import api from "./api";

export const reportsService = {
  getAdminDashboard: async () => {
    return api.get<AdminDashboardData>("/reports/dashboard/global");
  },
};
