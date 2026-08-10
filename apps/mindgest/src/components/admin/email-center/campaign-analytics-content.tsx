"use client";

import { useCampaignAnalytics } from "@/hooks/email-center";
import { DynamicMetricCard, Skeleton } from "@/components";
import { RequestError } from "@/components";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

interface CampaignAnalyticsContentProps {
  campaignId: string;
}

export function CampaignAnalyticsContent({ campaignId }: CampaignAnalyticsContentProps) {
  const { data, isLoading, isError, refetch } = useCampaignAnalytics(campaignId);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[320px] w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !data) {
    return <RequestError refetch={refetch} message="Erro ao carregar analytics da campanha" />;
  }

  const { metrics, name, type } = data;

  const chartData = [
    { label: "Enviados", value: metrics.totalSent, fill: "var(--primary)" },
    { label: "Entregues", value: metrics.delivered, fill: "var(--primary-500, #a66af7)" },
    { label: "Abertos", value: metrics.opened, fill: "var(--primary-400, #b980f8)" },
    { label: "Cliques", value: metrics.clicked, fill: "var(--primary-300, #ca9af9)" },
    { label: "Conversões", value: metrics.converted, fill: "var(--primary-200, #dbb3fb)" },
    { label: "Bounces", value: metrics.bounces, fill: "hsl(var(--destructive))" },
  ];

  const chartConfig: ChartConfig = {
    value: { label: "Quantidade" },
  };

  const isBilling = type === "BILLING";

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Performance Metrics */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4">Performance</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <DynamicMetricCard
            title={metrics.totalSent.toLocaleString("pt-AO")}
            subtitle="Enviados"
            description="Total de emails despachados"
            icon="Send"
          />
          <DynamicMetricCard
            title={metrics.delivered.toLocaleString("pt-AO")}
            subtitle="Entregues"
            description="Chegaram à caixa de entrada"
            icon="MailCheck"
          />
          <DynamicMetricCard
            title={`${metrics.openRate}%`}
            subtitle="Abertos"
            description={`${metrics.opened.toLocaleString("pt-AO")} aberturas`}
            icon="MailOpen"
          />
          <DynamicMetricCard
            title={`${metrics.clickRate}%`}
            subtitle="Cliques"
            description={`${metrics.clicked.toLocaleString("pt-AO")} cliques`}
            icon="MousePointerClick"
          />
          <DynamicMetricCard
            title={`${metrics.conversionRate}%`}
            subtitle="Conversões"
            description={`${metrics.converted.toLocaleString("pt-AO")} conversões`}
            icon="TrendingUp"
            colors="default"

          />
          <DynamicMetricCard
            title={metrics.bounces.toLocaleString("pt-AO")}
            subtitle="Bounces"
            description="Falhas de entrega"
            icon="MailX"
            colors="destructive"
          />
        </div>
      </div>

      {/* Revenue Recovery (billing only) */}
      {isBilling && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="mb-4 space-y-1">
            <h3 className="text-base font-semibold text-foreground">Receita Recuperada</h3>
            <p className="text-sm text-muted-foreground">
              Valor recuperado diretamente através desta campanha de cobrança
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {metrics.converted.toLocaleString("pt-AO")}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Clientes Recuperados</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.recoveredRevenue.toLocaleString("pt-AO")} Kz
              </div>
              <div className="text-sm text-muted-foreground mt-1">Valor Recuperado</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {metrics.conversionRate}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Taxa de Recuperação</div>
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="mb-6 space-y-1">
          <h3 className="text-base font-semibold text-foreground">Funil da Campanha</h3>
          <p className="text-sm text-muted-foreground">
            Distribuição do percurso dos {metrics.totalSent.toLocaleString("pt-AO")} emails enviados
          </p>
        </div>
        <div className="h-[280px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={{ fill: "hsl(var(--primary)/0.05)" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={44}>
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
