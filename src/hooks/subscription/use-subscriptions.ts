import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription-service";
import { Subscription } from "@/types";

export function useSubscriptions() {
    return useQuery({
        queryKey: ["subscriptions"],
        queryFn: async () => {
            const response = await subscriptionService.getSubscriptions();
            const raw = response.data;

            // Normalize: Extract array if nested, or return array if it's already an array
            if (Array.isArray(raw)) return raw;

            const dataKey = Object.keys(raw).find(
                (key) => Array.isArray((raw as any)[key])
            );

            return (dataKey ? (raw as any)[dataKey] : []) as Subscription[];
        },
    });
}

export function useUpdateSubscriptionStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            subscriptionService.updateSubscriptionStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        },
    });
}
