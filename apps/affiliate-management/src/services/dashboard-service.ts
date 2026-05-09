import { api } from "./api";

export interface AdminKPIs {
  pending_approvals: number;
  active_affiliates: number;
  pending_commissions_kz: number;
  total_paid_month_kz: number;
}

export const dashboardService = {
  getKPIs: async () => {
    return api.get<AdminKPIs>("/admin/dashboard/kpis");
  },
};
