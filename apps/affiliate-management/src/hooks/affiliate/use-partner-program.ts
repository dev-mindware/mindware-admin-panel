import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partnerProgramService } from "@/services/partner-program-service";
import { SubscriptionPaymentCreate, SubscriptionStatusUpdate } from "@workspace/types/affiliate";

export function useAdminPartnerPlans() {
  return useQuery({
    queryKey: ["admin-partner-program", "plans"],
    queryFn: async () => (await partnerProgramService.listPlans()).data,
  });
}

export function useAdminPartnerSubscriptions(filters?: {
  status?: string;
  affiliateId?: string;
  planCode?: string;
  billingPeriod?: string;
  source?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin-partner-program", "subscriptions", filters],
    queryFn: async () => (await partnerProgramService.listSubscriptions(filters)).data,
  });
}

export function useRegisterSubscriptionPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubscriptionPaymentCreate) => partnerProgramService.registerSubscriptionPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-program"] });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}

export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubscriptionStatusUpdate }) =>
      partnerProgramService.updateSubscriptionStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-program"] });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}

export function useReleaseValidatedCommissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => partnerProgramService.releaseValidatedCommissions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useApproveCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ affiliateId, notes }: { affiliateId: string; notes?: string }) =>
      partnerProgramService.approveCertification(affiliateId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}

export function useRejectCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ affiliateId, notes }: { affiliateId: string; notes?: string }) =>
      partnerProgramService.rejectCertification(affiliateId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}
