"use client";

import { useAllSubscriptions } from "@/hooks/subscription/use-subscriptions";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { Skeleton } from "@/components";

export function SubscriptionStats() {
    const { data: subscriptions, isLoading } = useAllSubscriptions();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    const stats = {
        active: subscriptions?.filter((s) => s.status === "ACTIVE").length || 0,
        pending: subscriptions?.filter((s) => s.status === "PENDING").length || 0,
        expired: subscriptions?.filter((s) => s.status === "EXPIRED").length || 0,
        trial: subscriptions?.filter((s) => s.status === "TRIALING").length || 0,
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <DynamicMetricCard
                title={stats.active}
                subtitle="Ativas"
                description="Subscrições em dia"
                icon="CircleCheck"
                variant="action"
            />
            <DynamicMetricCard
                title={stats.pending}
                subtitle="Pendentes"
                description="Aguardando aprovação"
                icon="Clock"
                variant="action"
            />
            <DynamicMetricCard
                title={stats.trial}
                subtitle="Em Teste"
                description="Subscrições em teste"
                icon="TriangleAlert"
                colors="default"
                variant="action"
            />
            <DynamicMetricCard
                title={stats.expired}
                subtitle="Expiradas"
                description="Subscrições encerradas"
                icon="CircleAlert"
                colors="destructive"
                variant="action"
            />
        </div>
    );
}
