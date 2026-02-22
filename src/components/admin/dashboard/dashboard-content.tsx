"use client";

import { useAllSubscriptions } from "@/hooks/subscription";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardContent() {
    const { data: subscriptions, isLoading } = useAllSubscriptions();

    const metrics = useMemo(() => {
        if (!subscriptions) return null;

        const total = subscriptions.length;
        const base = subscriptions.filter(s => s.plan?.name?.toLowerCase().includes("base")).length;
        const smart = subscriptions.filter(s => s.plan?.name?.toLowerCase().includes("smart")).length;
        const pro = subscriptions.filter(s => s.plan?.name?.toLowerCase().includes("pro")).length;

        return { total, base, smart, pro };
    }, [subscriptions]);

    const chartConfig = {
        count: {
            label: "Empresas",
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
        if (!subscriptions) return [];

        const statusCounts: Record<string, number> = {
            active: 0,
            trialing: 0,
            pending: 0,
            past_due: 0,
            expired: 0,
            cancelled: 0,
        };

        subscriptions.forEach(s => {
            const status = s.status.toLowerCase();
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        return Object.entries(statusCounts).map(([status, count]) => {
            const config = chartConfig[status as keyof typeof chartConfig];
            return {
                status: config?.label || status,
                count,
                fill: `var(--color-${status})`,
            };
        });
    }, [subscriptions]);

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-md" />
                    ))}
                </div>
                <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            {/* Metric Cards - Clean aligned grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DynamicMetricCard
                    title={metrics?.total || 0}
                    subtitle="Total de Empresas"
                    description="Total de empresas atualmente registradas no sistema."
                    icon="Building2"
                />
                <DynamicMetricCard
                    title={metrics?.base || 0}
                    subtitle="Plano Base"
                    description="Empresas que utilizam as funcionalidades essenciais."
                    icon="ShieldCheck"
                />
                <DynamicMetricCard
                    title={metrics?.smart || 0}
                    subtitle="Plano Smart"
                    description="Crescimento acelerado com automação e gestão inteligente."
                    icon="Zap"
                />
                <DynamicMetricCard
                    title={metrics?.pro || 0}
                    subtitle="Plano Pro"
                    description="Ecossistema completo para alta performance e escala."
                    icon="Trophy"
                />
            </div>

            {/* Chart Section - Refined look */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="mb-6 space-y-1">
                    <h3 className="text-xl font-bold tracking-tight">Evolução por Status</h3>
                    <p className="text-muted-foreground text-sm">Distribuição detalhada de todas as subscrições</p>
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
