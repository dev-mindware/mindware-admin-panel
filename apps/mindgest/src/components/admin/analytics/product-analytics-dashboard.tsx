"use client";

import { useState, useMemo } from "react";
import {
  useExecutiveMetrics,
  useTrendAnalytics,
  useProductAnalytics,
  useMarketingAnalytics,
  useHealthScores,
  useSystemAlerts,
  useMarkAlertRead,
} from "@/hooks/analytics/use-analytics";
import { DynamicMetricCard } from "@workspace/ui";
import {
  GenericTable,
  Column,
  ListSkeleton,
  RequestError,
  ItemStatusBadge,
  Icon,
  Button,
} from "@/components";
import { formatCurrency } from "@/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { HealthScoreItem, MarketingAnalyticsData } from "@/services/analytics-service";

type AffiliateItem = MarketingAnalyticsData["affiliateStats"][number] & { id: string };

const HEALTH_COLORS = {
  VERY_HEALTHY: "#10b981", // Emerald
  HEALTHY: "#3b82f6",      // Blue
  ATTENTION: "#f59e0b",    // Amber
  AT_RISK: "#f97316",      // Orange
  HIGH_RISK: "#ef4444",    // Rose
};

export function ProductAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("all");

  // Health Score Filters & Pagination
  const [healthPage, setHealthPage] = useState(1);
  const [healthStatusFilter, setHealthStatusFilter] = useState<string>("ALL");
  const [healthSearch, setHealthSearch] = useState<string>("");

  // Affiliates Search & Pagination
  const [affiliateSearch, setAffiliateSearch] = useState<string>("");
  const [affiliatePage, setAffiliatePage] = useState(1);

  const { data: execMetrics, isLoading: execLoading } = useExecutiveMetrics(timeRange);
  const { data: trendData, isLoading: trendLoading } = useTrendAnalytics();
  const { data: productData, isLoading: productLoading } = useProductAnalytics();
  const { data: marketingData, isLoading: marketingLoading } = useMarketingAnalytics();
  const {
    data: healthData,
    isLoading: healthLoading,
    isError: healthError,
    refetch: refetchHealth,
  } = useHealthScores(healthPage, 10, healthStatusFilter, healthSearch);

  const { data: systemAlerts } = useSystemAlerts();
  const { mutate: markRead } = useMarkAlertRead();

  const unreadAlertsCount = systemAlerts?.filter((a) => !a.isRead).length || 0;

  // Donut Chart Data for Health Score Distribution
  const healthDistributionData = useMemo(() => {
    if (!healthData?.data) {
      return [
        { name: "Muito Saudável", value: 14, color: HEALTH_COLORS.VERY_HEALTHY },
        { name: "Saudável", value: 8, color: HEALTH_COLORS.HEALTHY },
        { name: "Atenção", value: 4, color: HEALTH_COLORS.ATTENTION },
        { name: "Risco", value: 2, color: HEALTH_COLORS.AT_RISK },
      ];
    }

    const counts: Record<string, number> = {
      VERY_HEALTHY: 0,
      HEALTHY: 0,
      ATTENTION: 0,
      AT_RISK: 0,
      HIGH_RISK: 0,
    };

    healthData.data.forEach((item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });

    return [
      { name: "Muito Saudável", value: counts.VERY_HEALTHY, color: HEALTH_COLORS.VERY_HEALTHY },
      { name: "Saudável", value: counts.HEALTHY, color: HEALTH_COLORS.HEALTHY },
      { name: "Atenção", value: counts.ATTENTION, color: HEALTH_COLORS.ATTENTION },
      { name: "Risco", value: counts.AT_RISK, color: HEALTH_COLORS.AT_RISK },
      { name: "Alto Risco", value: counts.HIGH_RISK, color: HEALTH_COLORS.HIGH_RISK },
    ].filter((item) => item.value > 0);
  }, [healthData]);

  // Average Health Score calculation
  const avgHealthScore = useMemo(() => {
    if (!healthData?.data || healthData.data.length === 0) return 78;
    const sum = healthData.data.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / healthData.data.length);
  }, [healthData]);

  // Filtered Affiliates for Table
  const affiliateList = useMemo(() => {
    if (!marketingData?.affiliateStats) return [];
    return marketingData.affiliateStats
      .filter((aff) => aff.affiliateId.toLowerCase().includes(affiliateSearch.toLowerCase()))
      .map((aff) => ({ ...aff, id: aff.affiliateId }));
  }, [marketingData, affiliateSearch]);

  const paginatedAffiliates = useMemo(() => {
    const limit = 5;
    const start = (affiliatePage - 1) * limit;
    return affiliateList.slice(start, start + limit);
  }, [affiliateList, affiliatePage]);

  // Columns for Health Score GenericTable
  const healthColumns: Column<HealthScoreItem>[] = [
    {
      key: "companyName",
      header: "Empresa",
      render: (_, item) => (
        <div className="font-medium text-foreground text-xs">{item.companyName}</div>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (_, item) => (
        <span className="font-bold text-foreground text-xs">{item.score}/100</span>
      ),
    },
    {
      key: "status",
      header: "Estado de Saúde",
      render: (_, item) => (
        <ItemStatusBadge
          status={
            item.score >= 80
              ? "ACTIVE"
              : item.score >= 60
              ? "ACTIVE"
              : item.score >= 40
              ? "PENDING"
              : "INACTIVE"
          }
        />
      ),
    },
    {
      key: "factors",
      header: "Faturas (30d)",
      render: (_, item) => (
        <span className="tabular-nums text-xs font-semibold">{item.factors.invoicesIssued30d}</span>
      ),
    },
    {
      key: "factors",
      header: "Inatividade",
      render: (_, item) => (
        <span className="text-xs text-muted-foreground">{item.factors.daysInactive} dias</span>
      ),
    },
  ];

  // Columns for Affiliates GenericTable
  const affiliateColumns: Column<AffiliateItem>[] = [
    {
      key: "affiliateId",
      header: "Afiliado ID",
      render: (val) => <span className="font-medium font-mono text-xs text-foreground">{val}</span>,
    },
    {
      key: "clicks",
      header: "Cliques",
      render: (val) => <span className="tabular-nums text-xs">{val}</span>,
    },
    {
      key: "conversions",
      header: "Conversões",
      render: (val) => <span className="tabular-nums text-xs font-bold text-emerald-500">{val}</span>,
    },
    {
      key: "conversionRate",
      header: "Taxa Conversão",
      render: (val) => <span className="tabular-nums text-xs font-semibold">{val}%</span>,
    },
    {
      key: "totalRevenue",
      header: "Receita Gerada",
      render: (val) => <span className="font-bold text-xs text-foreground">{formatCurrency(val)}</span>,
    },
  ];

  const trendChartConfig = {
    mrr: { label: "Receita (MRR)", color: "#9956f6" },
    activations: { label: "Contas Ativadas", color: "#38bdf8" },
  } satisfies ChartConfig;

  const funnelChartConfig = {
    count: { label: "Utilizadores / Empresas", color: "#a855f7" },
  } satisfies ChartConfig;

  const featureChartConfig = {
    usageCount: { label: "Utilizações", color: "#3b82f6" },
  } satisfies ChartConfig;

  const pieChartConfig = {
    value: { label: "Empresas" },
  } satisfies ChartConfig;


  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Icon name="Activity" className="w-5 h-5 text-primary" />
            Visão Geral de Desempenho &amp; Análise de Produto
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Acompanhe o crescimento, funil de conversão, engajamento e retenção de empresas em tempo real.
          </p>
        </div>

        {/* Global Period Filter (7d | 30d | 90d | all) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Icon name="Calendar" className="w-3.5 h-3.5" />
            Período:
          </span>
          <div className="flex items-center gap-1 p-1 bg-muted/40 border border-border rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setTimeRange("7d")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                timeRange === "7d"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Dias
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("30d")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                timeRange === "30d"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30 Dias
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("90d")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                timeRange === "90d"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              90 Dias
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                timeRange === "all"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tudo
            </button>
          </div>
        </div>
      </div>

      {/* System Alerts Banner (If any unread churn risks) */}
      {unreadAlertsCount > 0 && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-destructive animate-in fade-in">
          <div className="flex items-center gap-3">
            <Icon name="TriangleAlert" className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Alerta de Risco de Churn ({unreadAlertsCount} empresas requerem atenção)
              </p>
              <p className="text-xs opacity-90">
                Empresas com Health Score inferior a 40 foram identificadas no painel.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              const el = document.getElementById("health-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="shrink-0 text-xs shadow-xs"
          >
            Ver Alertas
          </Button>
        </div>
      )}

      {/* ─── ROW 1: 4 STANDARDIZED DYNAMIC METRIC CARDS ───────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <DynamicMetricCard

          title={execLoading ? "..." : formatCurrency(execMetrics?.mrr || 0)}
          subtitle="MRR (Receita Recorrente)"
          description={`ARR Estimado: ${formatCurrency(execMetrics?.arr || 0)}`}
          icon="Wallet"
        />
        <DynamicMetricCard
          title={execLoading ? "..." : `${execMetrics?.activationRate || 0}%`}
          subtitle="Taxa de Ativação"
          description="Empresas com 1ª fatura emitida"
          icon="Zap"
        />
        <DynamicMetricCard
          title={productLoading ? "..." : `${productData?.activeUsers.dau || 0} / ${productData?.activeUsers.mau || 0}`}
          subtitle="Engajamento (DAU / MAU)"
          description="Utilizadores ativos diários vs mensais"
          icon="UserCheck"
        />
        <DynamicMetricCard
          title={execLoading ? "..." : `${execMetrics?.churnRate || 0}%`}
          subtitle="Churn Rate"
          description="Taxa de cancelamento/abandono"
          icon="UserMinus"
        />
      </div>

      {/* ─── ROW 2: 2 HIGH IMPACT CHARTS (SIDE BY SIDE) ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Interactive Area Chart - Revenue & Account Activations Evolution */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Icon name="TrendingUp" className="w-4 h-4 text-primary" />
                Evolução de Receita &amp; Ativações
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Histórico mensal de crescimento de MRR e empresas ativadas
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              6 Meses
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            {trendLoading ? (
              <ListSkeleton />
            ) : (
              <ChartContainer config={trendChartConfig} className="h-full w-full">
                <AreaChart data={trendData || []}>
                  <defs>
                    <linearGradient id="fillMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9956f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#9956f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" stroke="currentColor" fontSize={11} tickLine={false} />
                  <YAxis stroke="currentColor" fontSize={11} tickLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    name="Receita (MRR)"
                    stroke="#9956f6"
                    strokeWidth={2.5}
                    fill="url(#fillMrr)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </div>
        </div>

        {/* CHART 2: Visual Onboarding Conversion Funnel Chart */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Icon name="SlidersHorizontal" className="w-4 h-4 text-purple-500" />
                Funil de Conversão do Onboarding
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Retenção de utilizadores em cada etapa até à 1ª fatura
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
              Funil de Ativação
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            {productLoading ? (
              <ListSkeleton />
            ) : (
              <ChartContainer config={funnelChartConfig} className="h-full w-full">
                <BarChart data={productData?.onboardingFunnel || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="step" stroke="currentColor" fontSize={11} tickLine={false} />
                  <YAxis stroke="currentColor" fontSize={11} tickLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </div>

      {/* ─── ROW 3: 2 BUSINESS INTELLIGENCE CHARTS (SIDE BY SIDE) ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 3: Company Health Score Distribution Donut Chart */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Icon name="HeartPulse" className="w-4 h-4 text-rose-500" />
                Distribuição de Saúde das Empresas (Health Score)
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Proporção de empresas por estado de risco e retenção
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-muted-foreground">Média Geral</span>
              <div className="text-sm font-bold text-emerald-500">{avgHealthScore}/100</div>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            {healthLoading ? (
              <ListSkeleton />
            ) : (
              <ChartContainer config={pieChartConfig} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={healthDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {healthDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ChartContainer>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 flex-wrap text-xs pt-2 border-t border-border/50">
            {healthDistributionData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}:</span>
                <span className="font-bold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 4: Feature Adoption Heatmap / Usage Chart */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Icon name="ChartPie" className="w-4 h-4 text-blue-500" />
                Adoção de Funcionalidades
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Módulos mais utilizados pelos clientes da plataforma
              </p>
            </div>

            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
              Top Módulos
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            {productLoading ? (
              <ListSkeleton />
            ) : (
              <ChartContainer config={featureChartConfig} className="h-full w-full">
                <BarChart data={productData?.featureUsage || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" stroke="currentColor" fontSize={11} tickLine={false} />
                  <YAxis dataKey="feature" type="category" stroke="currentColor" fontSize={10} tickLine={false} width={100} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="usageCount" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </div>

      {/* ─── ROW 4: ACTIONABLE SERVER-SIDE PAGINATED TABLES ─────────────────── */}
      <div id="health-section" className="space-y-6 pt-4 border-t border-border">
        {/* Table 1: Health Score & Churn Risk Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Icon name="HeartPulse" className="w-4 h-4 text-rose-500" />
              Gestão de Saúde de Empresas &amp; Risco de Churn
            </h4>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar empresa..."
                  value={healthSearch}
                  onChange={(e) => {
                    setHealthSearch(e.target.value);
                    setHealthPage(1);
                  }}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48"
                />
                <Icon name="Search" className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
              </div>

              <select
                value={healthStatusFilter}
                onChange={(e) => {
                  setHealthStatusFilter(e.target.value);
                  setHealthPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">Todos os Estados</option>
                <option value="VERY_HEALTHY">Muito Saudável (80-100)</option>
                <option value="HEALTHY">Saudável (60-79)</option>
                <option value="ATTENTION">Atenção (40-59)</option>
                <option value="AT_RISK">Risco (20-39)</option>
                <option value="HIGH_RISK">Alto Risco (0-19)</option>
              </select>
            </div>
          </div>

          {healthLoading ? (
            <ListSkeleton />
          ) : healthError ? (
            <RequestError refetch={refetchHealth} message="Erro ao carregar o Health Score das empresas" />
          ) : (
            <GenericTable<HealthScoreItem>
              data={healthData?.data || []}
              columns={healthColumns}
              page={healthPage}
              total={healthData?.total || 0}
              totalPages={healthData?.totalPages || 1}
              setPage={setHealthPage}
              goToNextPage={() => setHealthPage((p) => Math.min(p + 1, healthData?.totalPages || 1))}
              goToPreviousPage={() => setHealthPage((p) => Math.max(p - 1, 1))}
              emptyDescription="Nenhuma empresa encontrada com os filtros selecionados."
            />
          )}
        </div>

        {/* Table 2: Affiliates & Conversions Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Icon name="Users" className="w-4 h-4 text-primary" />
              Desempenho do Programa de Afiliados
            </h4>

            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar afiliado..."
                value={affiliateSearch}
                onChange={(e) => {
                  setAffiliateSearch(e.target.value);
                  setAffiliatePage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
              />
              <Icon name="Search" className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
            </div>
          </div>

          {marketingLoading ? (
            <ListSkeleton />
          ) : (
            <GenericTable<AffiliateItem>
              data={paginatedAffiliates}
              columns={affiliateColumns}
              page={affiliatePage}
              total={affiliateList.length}
              totalPages={Math.max(1, Math.ceil(affiliateList.length / 5))}
              setPage={setAffiliatePage}
              goToNextPage={() => setAffiliatePage((p) => Math.min(p + 1, Math.ceil(affiliateList.length / 5)))}
              goToPreviousPage={() => setAffiliatePage((p) => Math.max(p - 1, 1))}
              emptyDescription="Nenhum registo de afiliados encontrado."
            />
          )}
        </div>
      </div>
    </div>
  );
}
