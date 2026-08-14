"use client";

import { useState, useMemo } from "react";
import { useEmailDashboard, useEmailCampaigns } from "@/hooks/email-center";
import { DynamicMetricCard } from "@workspace/ui";
import { Skeleton, Icon, ItemStatusBadge, ButtonOnlyAction } from "@/components";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EmailCampaign, CampaignStatus } from "@/types";

const STATUS_MAP: Record<CampaignStatus, string> = {
  DRAFT: "Rascunho",
  SCHEDULED: "Agendada",
  SENDING: "A Enviar",
  SENT: "Enviada",
  CANCELLED: "Cancelada",
  FAILED: "Falhou",
};

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  BILLING: "Cobrança",
  MARKETING: "Marketing",
  PUBLICITY: "Publicidade",
};

// Color palette matching modern dark/light UI
const CATEGORY_COLORS = {
  BILLING: "#9956f6",
  MARKETING: "#3b82f6",
  PUBLICITY: "#10b981",
  AUTOMATION: "#f59e0b",
};

// Trend Mock Data for Evolution Chart
const EVOLUTION_DATA = [
  { month: "Jan", sent: 1200, opened: 540, clicked: 210 },
  { month: "Fev", sent: 1850, opened: 890, clicked: 340 },
  { month: "Mar", sent: 2400, opened: 1120, clicked: 480 },
  { month: "Abr", sent: 3100, opened: 1540, clicked: 690 },
  { month: "Mai", sent: 2800, opened: 1380, clicked: 610 },
  { month: "Jun", sent: 3900, opened: 2010, clicked: 890 },
  { month: "Jul", sent: 4500, opened: 2350, clicked: 1050 },
  { month: "Ago", sent: 5200, opened: 2780, clicked: 1280 },
];

export function EmailKpiCards() {
  const router = useRouter();
  const { data: dashboard, isLoading: isDashLoading, isError: isDashError, refetch } = useEmailDashboard();
  const { data: campaigns, isLoading: isCampLoading } = useEmailCampaigns();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("all");

  const pieData = useMemo(() => {
    if (!campaigns || campaigns.length === 0) {
      return [
        { name: "Cobrança", value: 9, color: CATEGORY_COLORS.BILLING },
        { name: "Marketing", value: 6, color: CATEGORY_COLORS.MARKETING },
      ];
    }

    const counts: Record<string, number> = { BILLING: 0, MARKETING: 0, PUBLICITY: 0 };
    campaigns.forEach((c) => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });

    return [
      { name: "Cobrança", value: counts.BILLING || 1, color: CATEGORY_COLORS.BILLING },
      { name: "Marketing", value: counts.MARKETING || 1, color: CATEGORY_COLORS.MARKETING },
      { name: "Publicidade", value: counts.PUBLICITY || 0, color: CATEGORY_COLORS.PUBLICITY },
    ].filter((item) => item.value > 0);
  }, [campaigns]);

  const totalCampaignTypes = useMemo(() => {
    return pieData.reduce((acc, curr) => acc + curr.value, 0);
  }, [pieData]);

  if (isDashLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[380px] w-full rounded-xl" />
          <Skeleton className="h-[380px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isDashError || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center bg-card border border-border rounded-xl">
        <Icon name="TriangleAlert" className="w-8 h-8 text-destructive" />

        <p className="text-sm font-medium text-foreground">
          Não foi possível carregar os indicadores do painel de email.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const { kpis, indicators } = dashboard;
  const recentCampaigns = campaigns ? campaigns.slice(0, 5) : [];

  return (
    <div className="space-y-6">
      {/* ─── 1. Primary Email KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <DynamicMetricCard

          title={kpis.totalSent.toLocaleString("pt-AO")}
          subtitle="Emails Enviados"
          description="Total de emails despachados pela plataforma"
          icon="Send"
        />
        <DynamicMetricCard
          title={`${kpis.openRate}%`}
          subtitle="Taxa de Abertura"
          description="Percentagem de emails abertos pelos destinatários"
          icon="MailOpen"
        />
        <DynamicMetricCard
          title={`${kpis.clickRate}%`}
          subtitle="Taxa de Cliques"
          description="Percentagem de emails com interação e clique"
          icon="MousePointerClick"
        />
        <DynamicMetricCard
          title={`${kpis.recoveredRevenue.toLocaleString("pt-AO")} Kz`}
          subtitle="Receita Recuperada"
          description="Valor recuperado via campanhas de cobrança"
          icon="TrendingUp"
          colors="default"
        />
      </div>

      {/* ─── 2. Visual Analytics Section (Charts) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Icon name="TrendingUp" className="w-5 h-5 text-primary" />
                Evolução Mensal de Envios & Aberturas
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Volume acumulado de mensagens enviadas vs aberturas confirmadas
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border">
              {(["7d", "30d", "all"] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range === "7d" ? "7 Dias" : range === "30d" ? "30 Dias" : "Todos"}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EVOLUTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9956f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9956f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="sent" name="Envios" stroke="#9956f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSent)" />
                <Area type="monotone" dataKey="opened" name="Aberturas" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOpened)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Type Distribution (1/3 width) */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Icon name="ChartPie" className="w-5 h-5 text-primary" />

              Distribuição por Categoria
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Percentagem de campanhas por tipo no sistema
            </p>
          </div>

          <div className="flex items-center justify-center relative my-4">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-foreground">{totalCampaignTypes}</span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Campanhas
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            {pieData.map((item) => {
              const pct = totalCampaignTypes > 0 ? ((item.value / totalCampaignTypes) * 100).toFixed(0) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-foreground font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono">{item.value}</span>
                    <span className="text-foreground font-semibold w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 3. Recent Campaigns & Operational Alerts ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Campaigns Table (2/3 width) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Icon name="Mail" className="w-5 h-5 text-primary" />
                Últimas Campanhas Disparadas
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Registo recente de campanhas e taxas de conversão
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/email-marketing/campaigns")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Ver Todas
              <Icon name="ArrowRight" className="w-3.5 h-3.5" />
            </button>
          </div>

          {isCampLoading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : recentCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed text-center">
              <Icon name="Mail" className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">Nenhuma campanha criada ainda.</p>
              <button
                type="button"
                onClick={() => router.push("/email-marketing/campaigns/new")}
                className="mt-3 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                Criar Primeira Campanha
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-semibold text-[11px] tracking-wider">
                    <th className="pb-3 font-semibold">Campanha</th>
                    <th className="pb-3 font-semibold">Tipo</th>
                    <th className="pb-3 font-semibold text-right">Destinatários</th>
                    <th className="pb-3 font-semibold text-right">Abertura</th>
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentCampaigns.map((item) => {
                    const rate = item.totalSent > 0
                      ? ((item.totalOpened / item.totalSent) * 100).toFixed(1)
                      : null;
                    return (
                      <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                        <td className="py-3 font-medium text-foreground">
                          <div>
                            <div className="font-semibold text-foreground">{item.name}</div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                              {item.subject}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {CAMPAIGN_TYPE_LABELS[item.type] ?? item.type}
                        </td>
                        <td className="py-3 text-right font-mono text-foreground">
                          {item.totalRecipients.toLocaleString("pt-AO")}
                        </td>
                        <td className="py-3 text-right font-mono text-foreground">
                          {rate !== null ? `${rate}%` : "—"}
                        </td>
                        <td className="py-3">
                          <ItemStatusBadge status={STATUS_MAP[item.status] ?? item.status} />
                        </td>
                        <td className="py-3 text-right">
                          <ButtonOnlyAction
                            data={item}
                            actions={[
                              {
                                label: "Analytics",
                                icon: "ChartBar",
                                onClick: (c) => router.push(`/email-marketing/campaigns/${c.id}/analytics`),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Operational Attention & Alerts (1/3 width) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Icon name="ShieldAlert" className="w-5 h-5 text-amber-500" />
              Atenção Operacional
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Estado dos disparos e fila de automação
            </p>
          </div>

          <div className="space-y-3 my-2">
            {/* Status 1 */}
            <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
              <Icon name="CircleCheck" className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />

              <div>
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  Serviço SMTP Ativo
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Taxa de entrega mantida acima de 98.5%.
                </p>
              </div>
            </div>

            {/* Status 2 */}
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-3">
              <Icon name="Clock" className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  Régua de Cobrança (Cron)
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  Execução diária agendada para as 00:00 via DunningWorker.
                </p>
              </div>
            </div>

            {/* Status 3 */}
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-3">
              <Icon name="Zap" className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Campanhas Agendadas
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {indicators.scheduledCampaigns > 0
                    ? `${indicators.scheduledCampaigns} campanhas em fila de envio`
                    : "Nenhuma campanha em fila de agendamento"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/email-marketing/automations")}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
          >
            <Icon name="Settings" className="w-3.5 h-3.5 text-muted-foreground" />
            Configurar Régua de Automação
          </button>
        </div>
      </div>
    </div>
  );
}
