import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription-service";
import { Subscription, SubscriptionStats, SubscriptionStatus } from "@/types";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export function useSubscriptions(filters?: {
  status?: string;
  company?: string;
}) {
  return usePagination<Subscription>({
    endpoint: "/subscriptions",
    queryKey: "subscriptions",
    api,
    queryParams: {
      status: filters?.status || undefined,
      company: filters?.company || undefined,
    },
  });
}

export function useSubscriptionStats() {
  return useQuery<SubscriptionStats>({
    queryKey: ["subscriptions", "stats"],
    queryFn: async () => {
      const response = await subscriptionService.getSubscriptionStats();
      return response.data;
    },
  });
}

export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      subscriptionService.updateSubscriptionStatus(
        id,
        status as SubscriptionStatus,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "stats"] });
    },
  });
}

export function useCheckSubscriptionExpirations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionService.checkExpirations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
