"use client";

import { useSubscriptionStats } from "@/hooks/subscription/use-subscriptions";
import { DynamicMetricCard } from "@workspace/ui";
import { Skeleton } from "@/components";

export function SubscriptionStats() {
    const { data: stats, isLoading, isError, refetch } = useSubscriptionStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (isError || !stats) {
        return (
            <div className="mb-8 flex flex-col items-center justify-center gap-2 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                    Não foi possível carregar os indicadores de subscrições.
                </p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    const { byStatus } = stats;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <DynamicMetricCard
                title={byStatus.ACTIVE ?? 0}
                subtitle="Ativas"
                description="Subscrições em dia"
                icon="CircleCheck"
                variant="action"
            />
            <DynamicMetricCard
                title={byStatus.PENDING ?? 0}
                subtitle="Pendentes"
                description="Aguardando aprovação"
                icon="Clock"
                variant="action"
            />
            <DynamicMetricCard
                title={byStatus.TRIALING ?? 0}
                subtitle="Em Teste"
                description="Subscrições em teste"
                icon="TriangleAlert"
                colors="default"
                variant="action"
            />
            <DynamicMetricCard
                title={byStatus.PAST_DUE ?? 0}
                subtitle="Atrasadas"
                description="Pagamento em atraso"
                icon="Hourglass"
                variant="action"
            />
            <DynamicMetricCard
                title={byStatus.EXPIRED ?? 0}
                subtitle="Expiradas"
                description="Subscrições encerradas"
                icon="CircleAlert"
                colors="destructive"
                variant="action"
            />
            <DynamicMetricCard
                title={byStatus.CANCELLED ?? 0}
                subtitle="Canceladas"
                description="Canceladas pelo cliente"
                icon="Ban"
                colors="destructive"
                variant="action"
            />
        </div>
    );
}
