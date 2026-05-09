import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leadService } from "@/services/lead-service";
import { Lead, LeadAdminCreate, LeadUpdate, LeadStatus } from "@workspace/types/affiliate";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export function useLeads(filters?: {
  status?: LeadStatus;
}) {
  return usePagination<Lead>({
    endpoint: "/admin/leads",
    queryKey: ["leads", String(filters?.status || "all")],
    queryParams: {
      status: filters?.status || undefined,
    },
    api,
  });
}

export function useCreateLeadAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LeadAdminCreate) => leadService.registerLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadService.updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
