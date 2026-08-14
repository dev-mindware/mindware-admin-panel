"use client";

import { useCampaignAnalytics, useSendCampaignNow } from "@/hooks/email-center";

import { DynamicMetricCard, Skeleton, RequestError, ItemStatusBadge, Icon, Button } from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatDateTime } from "@/utils";

interface CampaignAnalyticsContentProps {
  campaignId: string;
}

const DONUT_COLORS = ["#9956f6", "#38bdf8", "#34d399", "#f87171"];

export function CampaignAnalyticsContent({ campaignId }: CampaignAnalyticsContentProps) {
  const { data, isLoading, isError, refetch } = useCampaignAnalytics(campaignId);
  const { mutateAsync: sendNow, isPending: isRetrying } = useSendCampaignNow();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[340px] w-full rounded-xl" />
          <Skeleton className="h-[340px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <RequestError refetch={refetch} message="Erro ao carregar analytics da campanha" />;
  }

  const { metrics, name, type, status, logs = [] } = data;

  const isBilling = type === "BILLING";
  const deliveryRateNumber = metrics.totalSent > 0 ? ((metrics.delivered / metrics.totalSent) * 100).toFixed(1) : "0.0";

  // Pie / Donut Chart Data (Distribution of outcomes)
  const donutData = [
    { name: "Entregues", value: metrics.delivered, color: "#9956f6" },
    { name: "Abertos", value: metrics.opened, color: "#38bdf8" },
    { name: "Cliques", value: metrics.clicked, color: "#34d399" },
    { name: "Bounces / Falhas", value: metrics.bounces, color: "#f87171" },
  ].filter((item) => item.value > 0);

  // Fallback if all values are 0
  const finalDonutData = donutData.length > 0 ? donutData : [{ name: "Sem Dados", value: 1, color: "#9ca3af" }];

  // Rates Bar Chart Data (%)
  const ratesBarData = [
    { label: "Entrega", value: Number(deliveryRateNumber), fill: "#9956f6" },
    { label: "Abertura", value: Number(metrics.openRate), fill: "#38bdf8" },
    { label: "Cliques", value: Number(metrics.clickRate), fill: "#34d399" },
    { label: "Conversão", value: Number(metrics.conversionRate), fill: "#a855f7" },
  ];

  const chartConfig: ChartConfig = {
    value: { label: "Percentagem (%)" },
  };

  const handleRetry = async () => {

    try {
      const res = await sendNow(campaignId);
      SucessMessage(`Reenvio concluído: ${res.data.sent} emails despachados.`);
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Erro ao tentar reenviar a campanha");
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Failed Campaign Retry Banner */}
      {status === "FAILED" && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-destructive">
          <div className="flex items-center gap-3">
            <Icon name="TriangleAlert" className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">O disparo desta campanha falhou</p>
              <p className="text-xs opacity-90">Pode tentar processar novamente o envio para os destinatários elegíveis.</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRetry}
            disabled={isRetrying}
            className="shrink-0 text-xs shadow-sm"
          >
            <Icon name="RotateCcw" className="w-3.5 h-3.5 mr-1.5" />
            {isRetrying ? "A reprocessar..." : "Tentar Novamente (Retry)"}
          </Button>
        </div>
      )}

      {/* ─── Top 3 Summarized KPI Cards (Replaces clutter of 6-9 cards) ─────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">
              Campanha do tipo <strong className="text-foreground">{type}</strong> • Estado: <strong className="text-primary">{status}</strong>
            </p>
          </div>
          {status === "FAILED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
              className="text-xs"
            >
              <Icon name="RotateCcw" className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Retry
            </Button>
          )}
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Volume & Delivery */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Envio &amp; Entrega
              </span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon name="Send" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">
                {metrics.totalSent.toLocaleString("pt-AO")} <span className="text-xs font-normal text-muted-foreground">emails</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {deliveryRateNumber}% entregues
                </span>
                <span className="text-muted-foreground">({metrics.delivered.toLocaleString("pt-AO")} caixas)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Engagement (Open & Click Rates) */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Engajamento &amp; Abertura
              </span>
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                <Icon name="MailOpen" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground flex items-baseline gap-2">
                {metrics.openRate}%
                <span className="text-xs font-medium text-muted-foreground">Taxa Abertura</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>Cliques: <strong className="text-foreground">{metrics.clickRate}%</strong> ({metrics.clicked.toLocaleString("pt-AO")})</span>
              </div>
            </div>
          </div>

          {/* Card 3: Revenue & Conversion Impact */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isBilling ? "Receita Recuperada" : "Conversões"}
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Icon name="TrendingUp" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-primary">
                {isBilling ? `${metrics.recoveredRevenue.toLocaleString("pt-AO")} Kz` : `${metrics.converted.toLocaleString("pt-AO")} Ações`}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {metrics.conversionRate}% conversão
                </span>
                <span>({metrics.converted.toLocaleString("pt-AO")} clientes)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Visual Charts Grid (Pie / Donut + Performance Bar) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Donut Chart - Proportion Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="ChartPie" className="w-4 h-4 text-primary" />
              Distribuição Proporcional de Resultados
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Proporção visual de entregas, aberturas, cliques e falhas
            </p>
          </div>

          <div className="h-[260px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {finalDonutData.map((entry, index) => (
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
                  formatter={(val: any) => [`${val} ocorrências`, "Total"]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-foreground font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Bar Chart - Performance Rates (%) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="ChartBar" className="w-4 h-4 text-primary" />

              Taxas de Desempenho (%)
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comparativo de eficácia ao longo das etapas da campanha
            </p>
          </div>

          <div className="h-[260px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={ratesBarData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
                  cursor={{ fill: "hsl(var(--primary)/0.05)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {ratesBarData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>

      {/* ─── Recent Log Activity Table ────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="List" className="w-4 h-4 text-primary" />
              Histórico de Envio &amp; Atividade dos Destinatários
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Últimos registos de entregas e interações dos destinatários nesta campanha
            </p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Nenhum registo de envio disponível de momento.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Destinatário</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Enviado em</th>
                  <th className="px-4 py-3">Aberto em</th>
                  <th className="px-4 py-3">Clicado em</th>
                  {isBilling && <th className="px-4 py-3">Valor Recuperado</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{log.recipientName || "Cliente"}</div>
                      <div className="text-muted-foreground text-[11px] font-mono">{log.recipientEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <ItemStatusBadge status={log.status || "SENT"} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.sentAt ? formatDateTime(log.sentAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {log.openedAt ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatDateTime(log.openedAt)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.clickedAt ? (
                        <span className="text-sky-600 dark:text-sky-400 font-medium">
                          {formatDateTime(log.clickedAt)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    {isBilling && (
                      <td className="px-4 py-3 font-semibold text-primary">
                        {log.recoveredAmount ? `${log.recoveredAmount.toLocaleString("pt-AO")} Kz` : "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
