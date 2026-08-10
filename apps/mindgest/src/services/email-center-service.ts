import { api } from "./api";
import type {
  EmailDashboardResponse,
  EmailCampaign,
  EmailTemplate,
  EmailLog,
  CampaignAnalyticsResponse,
  CreateCampaignPayload,
  SendTestEmailPayload,
} from "@/types";

export const emailCenterService = {
  // Dashboard
  getDashboard: () =>
    api.get<EmailDashboardResponse>("/email-center/dashboard"),

  // Campaigns
  getCampaigns: () => api.get<EmailCampaign[]>("/email-center/campaigns"),

  getCampaign: (id: string) =>
    api.get<EmailCampaign>(`/email-center/campaigns/${id}`),

  createCampaign: (payload: CreateCampaignPayload) =>
    api.post<EmailCampaign>("/email-center/campaigns", payload),

  updateCampaign: (id: string, payload: Partial<CreateCampaignPayload>) =>
    api.put<EmailCampaign>(`/email-center/campaigns/${id}`, payload),

  deleteCampaign: (id: string) =>
    api.delete<void>(`/email-center/campaigns/${id}`),

  sendCampaignNow: (id: string) =>
    api.post<{ campaignId: string; sent: number; failed: number; skipped: number }>(
      `/email-center/campaigns/${id}/send`,
      {}
    ),

  // Test email
  sendTestEmail: (payload: SendTestEmailPayload) =>
    api.post<boolean>("/email-center/send-test", payload),

  // Analytics
  getCampaignAnalytics: (id: string) =>
    api.get<CampaignAnalyticsResponse>(`/email-center/campaigns/${id}/analytics`),

  getCompanyHistory: (companyId: string) =>
    api.get<EmailLog[]>(`/email-center/customers/${companyId}/history`),

  // Templates
  getTemplates: () => api.get<EmailTemplate[]>("/email-center/templates"),

  createTemplate: (payload: Partial<EmailTemplate>) =>
    api.post<EmailTemplate>("/email-center/templates", payload),
};
