"use client";

import { useSubscriptionStats } from "@/hooks/subscription";
import { DynamicMetricCard } from "@workspace/ui";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig
} from "@workspace/ui";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { useMemo } from "react";
import { Skeleton } from "@workspace/ui";
import { icons } from "lucide-react";
import type { SubscriptionStatus } from "@/types";

const STATUS_ORDER: SubscriptionStatus[] = [
    "ACTIVE",
    "TRIALING",
    "PENDING",
    "PAST_DUE",
    "EXPIRED",
    "CANCELLED",
];

const STATUS_CONFIG: Record<
    SubscriptionStatus,
    { label: string; colorKey: string }
> = {
    ACTIVE: { label: "Ativo", colorKey: "active" },
    TRIALING: { label: "Trial", colorKey: "trialing" },
    PENDING: { label: "Pendente", colorKey: "pending" },
    PAST_DUE: { label: "Atrasado", colorKey: "past_due" },
    EXPIRED: { label: "Expirado", colorKey: "expired" },
    CANCELLED: { label: "Cancelado", colorKey: "cancelled" },
};

const PLAN_ICONS: Record<string, keyof typeof icons> = {
    base: "ShieldCheck",
    smart: "Zap",
    pro: "Trophy",
    flex: "Layers",
};

function planIcon(planName: string): keyof typeof icons {
    const lower = planName.toLowerCase();
    for (const [key, icon] of Object.entries(PLAN_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return "Package";
}

export function DashboardContent() {
    const { data: stats, isLoading, isError, refetch } = useSubscriptionStats();

    const chartConfig = {
        count: {
            label: "Subscrições",
        },
        active: {
            label: "Ativo",
            color: "var(--primary)",
        },
        trialing: {
            label: "Trial",
            color: "var(--primary-500)",
        },
        past_due: {
            label: "Atrasado",
            color: "var(--primary-400)",
        },
        cancelled: {
            label: "Cancelado",
            color: "var(--primary-300)",
        },
        pending: {
            label: "Pendente",
            color: "var(--primary-200)",
        },
        expired: {
            label: "Expirado",
            color: "var(--primary-100)",
        },
    } satisfies ChartConfig;

    const chartData = useMemo(() => {
        if (!stats?.byStatus) return [];

        return STATUS_ORDER.map((status) => {
            const config = STATUS_CONFIG[status];
            return {
                status: config.label,
                count: stats.byStatus[status] ?? 0,
                fill: `var(--color-${config.colorKey})`,
            };
        });
    }, [stats]);

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-md" />
                    ))}
                </div>
                <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
        );
    }

    if (isError || !stats) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <p className="text-muted-foreground">
                    Não foi possível carregar os indicadores.
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

    const planCards = stats.byPlan;

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            <div
                className={`grid grid-cols-2 gap-2.5 sm:gap-4 ${
                    planCards.length >= 3
                        ? "lg:grid-cols-4"
                        : planCards.length === 2
                          ? "lg:grid-cols-3"
                          : "lg:grid-cols-2"
                }`}

            >
                <DynamicMetricCard
                    title={stats.totalCompanies}
                    subtitle="Total de Empresas"
                    description="Total de empresas registadas no sistema."
                    icon="Building2"
                />
                {planCards.map((plan) => (
                    <DynamicMetricCard
                        key={plan.planId}
                        title={plan.count}
                        subtitle={plan.planName.startsWith("Plano ") ? plan.planName : `Plano ${plan.planName}`}
                        description={`${plan.count} ${plan.count === 1 ? "subscrição" : "subscrições"} neste plano.`}
                        icon={planIcon(plan.planName)}
                    />
                ))}
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="mb-6 space-y-1">
                    <h3 className="text-xl font-bold tracking-tight">Distribuição por Status</h3>
                    <p className="text-muted-foreground text-sm">
                        Distribuição de todas as {stats.totalSubscriptions} subscrições
                    </p>
                </div>

                <div className="h-[350px] w-full">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="status"
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: 'hsl(var(--primary)/0.05)' }} />
                            <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]}
                                barSize={50}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
}
