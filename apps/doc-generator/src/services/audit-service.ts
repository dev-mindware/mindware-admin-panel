import { api } from "@/services/api";
import { AuditLog, AuditLogListResponse, AuditLogSummary } from "@/types/audit-log";

export const auditService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    resource?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLogListResponse> => {
    const { data } = await api.get("/audit-logs", { params });
    return data;
  },

  getSummary: async (): Promise<AuditLogSummary> => {
    const { data } = await api.get("/audit-logs/summary");
    return data;
  },
};
