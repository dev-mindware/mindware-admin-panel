"use client";

import { useDashboardKPIs } from "@/hooks/affiliate";
import { DynamicMetricCard } from "@workspace/ui";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig
} from "@workspace/ui";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@workspace/ui";
import { formatCurrency } from "@workspace/utils";

export function DashboardContent() {
    const { data: kpis, isLoading } = useDashboardKPIs();

    const chartConfig = {
        value: {
            label: "Leads",
            color: "var(--primary)",
        },
    } satisfies ChartConfig;

    // Dados estáticos para o gráfico (backend ainda não fornece série temporal)
    const chartData = [
        { name: "Seg", value: 12 },
        { name: "Ter", value: 18 },
        { name: "Qua", value: 15 },
        { name: "Qui", value: 25 },
        { name: "Sex", value: 22 },
        { name: "Sab", value: 10 },
        { name: "Dom", value: 5 },
    ];

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DynamicMetricCard
                    title={kpis?.active_affiliates || 0}
                    subtitle="Afiliados Ativos"
                    description="Parceiros em operação."
                    icon="Users"
                />
                <DynamicMetricCard
                    title={kpis?.pending_approvals || 0}
                    subtitle="Aprovações Pendentes"
                    description="Afiliados aguardando revisão."
                    icon="UserCheck"
                />
                <DynamicMetricCard
                    title={formatCurrency(kpis?.pending_commissions_kz || 0)}
                    subtitle="Comissões Pendentes"
                    description="Aguardando liberação."
                    icon="BadgeDollarSign"
                />
                <DynamicMetricCard
                    title={formatCurrency(kpis?.total_paid_month_kz || 0)}
                    subtitle="Pago este Mês"
                    description="Total liquidado no período."
                    icon="DollarSign"
                />
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="mb-6 space-y-1">
                    <h3 className="text-xl font-bold tracking-tight">Leads nos últimos 7 dias</h3>
                    <p className="text-muted-foreground text-sm">Volume diário de captação (Demonstrativo)</p>
                </div>

                <div className="h-[350px] w-full">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <YAxis
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: 'hsl(var(--primary)/0.05)' }} />
                            <Bar
                                dataKey="value"
                                fill="var(--primary)"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
}
