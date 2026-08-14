import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { emailCenterService } from "@/services/email-center-service";
import type {
  CreateCampaignPayload,
  SendTestEmailPayload,
  EmailTemplate,
} from "@/types";

// ─── Dashboard ──────────────────────────────────────────────────────────────

export function useEmailDashboard() {
  return useQuery({
    queryKey: ["email-center", "dashboard"],
    queryFn: async () => {
      const res = await emailCenterService.getDashboard();
      return res.data;
    },
  });
}

// ─── Campaigns ──────────────────────────────────────────────────────────────

export function useEmailCampaigns() {
  return useQuery({
    queryKey: ["email-center", "campaigns"],
    queryFn: async () => {
      const res = await emailCenterService.getCampaigns();
      return res.data;
    },
  });
}

export function useEmailCampaign(id: string) {
  return useQuery({
    queryKey: ["email-center", "campaigns", id],
    queryFn: async () => {
      const res = await emailCenterService.getCampaign(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) =>
      emailCenterService.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-center", "campaigns"] });
    },
  });
}

export function useUpdateCampaign(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateCampaignPayload>) =>
      emailCenterService.updateCampaign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-center", "campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["email-center", "campaigns", id] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailCenterService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-center", "campaigns"] });
    },
  });
}

export function useSendCampaignNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailCenterService.sendCampaignNow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-center", "campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["email-center", "dashboard"] });
    },
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: (payload: SendTestEmailPayload) =>
      emailCenterService.sendTestEmail(payload),
  });
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export function useCampaignAnalytics(id: string) {
  return useQuery({
    queryKey: ["email-center", "analytics", id],
    queryFn: async () => {
      const res = await emailCenterService.getCampaignAnalytics(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCompanyEmailHistory(companyId: string) {
  return useQuery({
    queryKey: ["email-center", "history", companyId],
    queryFn: async () => {
      const res = await emailCenterService.getCompanyHistory(companyId);
      return res.data;
    },
    enabled: !!companyId,
  });
}

// ─── Templates ──────────────────────────────────────────────────────────────

export function useEmailTemplates() {
  return useQuery({
    queryKey: ["email-center", "templates"],
    queryFn: async () => {
      const res = await emailCenterService.getTemplates();
      return res.data;
    },
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<EmailTemplate>) =>
      emailCenterService.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-center", "templates"] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EmailTemplate> }) =>
      emailCenterService.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-center", "templates"] });
    },
  });
}


export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailCenterService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-center", "templates"] });
    },
  });
}
