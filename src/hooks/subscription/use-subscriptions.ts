import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription-service";
import { Subscription, SubscriptionStatus } from "@/types";
import { usePagination } from "@/hooks/common";

export function useSubscriptions(filters?: {
  status?: string;
  company?: string;
}) {
  return usePagination<Subscription>({
    endpoint: "/subscriptions",
    queryKey: "subscriptions",
    queryParams: {
      status: filters?.status || undefined,
      company: filters?.company || undefined,
    },
  });
}

export function useAllSubscriptions() {
  return useQuery<Subscription[]>({
    queryKey: ["subscriptions", "all"],
    queryFn: async () => {
      const response = await subscriptionService.getSubscriptions();
      const raw = response.data;

      if (Array.isArray(raw)) return raw;

      const dataKey = Object.keys(raw).find((key) =>
        Array.isArray((raw as any)[key]),
      );

      return (dataKey ? (raw as any)[dataKey] : []) as Subscription[];
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
    },
  });
}
