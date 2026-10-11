"use client";

import Link from "next/link";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarListPanel, Button, ChartContainer, DonutPanel, GaugePanel, ChartTooltip, ChartTooltipContent, Icon, MetricGrid, Panel, SelectField, Skeleton, TitleList, ToneBadge, type ChartConfig } from "@workspace/ui";
import { useAnalytics } from "@/hooks/commerce/use-analytics";
import { slicesFromCounts } from "@/utils/charts";
import { day, kz, kzShort, monthLabel, since } from "@/utils/format";
import type { Analytics } from "@/types/api";

const revenueConfig = { amount: { label: "Receita", color: "var(--primary)" } } satisfies ChartConfig;
const schoolsConfig = { n: { label: "Novas escolas", color: "var(--primary)" } } satisfies ChartConfig;

const ACTION_LABEL: Record<string, string> = { criacao: "Criou", actualizacao: "Actualizou", fecho: "Fechou", reabertura: "Reabriu", anulacao: "Anulou" };
const ENTITY_LABEL: Record<string, string> = {
  subscription: "subscrição", subscription_order: "ordem de subscrição", plan: "plano", addon: "add-on", coupon: "cupão", school: "escola",
  app_user: "utilizador", user_school_role: "papel de utilizador", impersonation: "personificação",
};

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>;
}

function AttentionRow({ href, icon, label, value, danger }: { href: string; icon: Parameters<typeof Icon>[0]["name"]; label: string; value: number; danger?: boolean }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/60">
      <span className="flex items-center gap-2"><Icon name={icon} className="size-4 text-muted-foreground" />{label}</span>
      <ToneBadge tone={value === 0 ? "neutral" : danger ? "danger" : "warning"} label={String(value)} />
    </Link>
  );
}

function Charts({ a }: { a: Analytics }) {
  const revenue = a.series.revenue.map((r) => ({ month: monthLabel(r.month), amount: Number(r.amount) }));
  const schools = a.series.new_schools.map((r) => ({ month: monthLabel(r.month), n: r.n }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Panel title="Receita aprovada por mês" description={`Pagamentos confirmados (Kz) · total ${kzShort(a.kpis.revenue_total)}`} icon="Banknote" className="md:col-span-2">
        <ChartContainer config={revenueConfig} className="h-56 w-full">
          <BarChart data={revenue}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)} M` : v >= 1000 ? `${Math.round(v / 1000)} k` : String(v))} />
            <ChartTooltip content={<ChartTooltipContent formatter={(v) => kz(Number(v))} />} />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Panel>

      <BarListPanel title="MRR por plano" description="Receita recorrente mensal (Kz)" icon="Layers" formatValue={kzShort} items={a.series.mrr_by_plan.map((p) => ({ label: p.name, value: Number(p.mrr) }))} emptyText="Sem planos." />

      <Panel title="Novas escolas por mês" icon="School">
        <ChartContainer config={schoolsConfig} className="h-44 w-full">
          <AreaChart data={schools}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area dataKey="n" type="monotone" fill="var(--color-n)" fillOpacity={0.18} stroke="var(--color-n)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </Panel>

      <DonutPanel
        title="Escolas por estado"
        description="Estado comercial de todas as escolas"
        icon="ChartPie"
        centerLabel="escolas"
        slices={slicesFromCounts(a.series.schools_by_status, STATUS)}
        emptyText="Ainda sem escolas."
      />
      <GaugePanel title="Conversão teste → pago" description={`Coorte de ${a.kpis.trial_conversion_cohort} escola(s)`} icon="Percent" percent={a.kpis.trial_conversion_rate} caption="das escolas em teste passam a pagar" />
    </div>
  );
}

const STATUS: Record<string, string> = { trial: "Em teste", active: "Activas", past_due: "Em atraso", grace: "Tolerância", suspended: "Suspensas", cancelled: "Canceladas", expired: "Expiradas" };

/**
 * Dashboard da plataforma: linha 1 (KPIs), linha 2 (receita, MRR por plano, novas escolas, estados), linha 3 (o que precisa de atenção,
 * com atalho para agir) e linha 4 (actividade recente). Tudo vem de `/admin/analytics/overview`, calculado no servidor.
 */
export function DashboardPageContent() {
  const [months, setMonths] = useState("12");
  const q = useAnalytics(Number(months));
  const a = q.data;

  const kpis = a
    ? [
        { title: kzShort(a.kpis.mrr), subtitle: "MRR", description: `ARR ${kzShort(a.kpis.arr)}`, icon: "TrendingUp" as const },
        { title: a.kpis.schools_paying, subtitle: "Escolas a pagar", description: `${a.kpis.schools_total} no total`, icon: "School" as const },
        { title: a.kpis.schools_trial, subtitle: "Em período de teste", description: `${a.attention.trials_ending.length} a terminar em 7 dias`, icon: "FlaskConical" as const },
        { title: a.kpis.orders_waiting, subtitle: "Comprovativos por rever", description: a.attention.stale_orders ? `${a.attention.stale_orders} há mais de 24 h` : "Fila em dia", icon: "ReceiptText" as const, variant: a.kpis.orders_waiting > 0 ? ("action" as const) : ("default" as const) },
                      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <TitleList title="Dashboard" suTitle="O estado da plataforma de relance: dinheiro, escolas e o que precisa de si hoje.">
        <div className="w-40">
          <SelectField label="" value={months} onValueChange={setMonths} options={[{ value: "6", label: "Últimos 6 meses" }, { value: "12", label: "Últimos 12 meses" }, { value: "24", label: "Últimos 24 meses" }]} />
        </div>
      </TitleList>

      <MetricGrid isLoading={q.isLoading} isError={q.isError} onRetry={() => void q.refetch()} items={kpis} skeletons={4} />

      {q.isLoading && <Skeleton className="h-72 w-full rounded-xl" />}
      {a && <Charts a={a} />}

      {a && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Precisa de atenção" description="Cada linha leva ao sítio onde se resolve" icon="TriangleAlert">
            <div className="space-y-0.5">
              <AttentionRow href="/subscriptions" icon="Clock" label="Comprovativos há mais de 24 h" value={a.attention.stale_orders} danger />
              <AttentionRow href="/security" icon="ShieldAlert" label="Alertas de segurança por reconhecer" value={a.attention.security_alerts_open} danger />
              <AttentionRow href="/operations" icon="Inbox" label="Eventos em dead-letter" value={a.attention.dead_letter_events} danger />
              <AttentionRow href="/operations" icon="FileX" label="Facturação fiscal pendente ou rejeitada" value={a.attention.fiscal_submissions_pending + a.attention.fiscal_submissions_failed} />
              <AttentionRow href="/operations" icon="FileWarning" label="Relatórios falhados (24 h)" value={a.attention.failed_report_jobs_24h} />
              <AttentionRow href="/security?tab=personificacoes" icon="UserCog" label="Personificações activas" value={a.attention.impersonations_active} />
            </div>
          </Panel>

          <Panel title="Testes a terminar" description="Próximos 7 dias" icon="CalendarClock" action={<Button asChild size="sm" variant="ghost"><Link href="/subscriptions?tab=subscricoes">Ver todas</Link></Button>}>
            {a.attention.trials_ending.length === 0 ? (
              <Empty text="Nenhum teste a terminar esta semana." />
            ) : (
              <ul className="divide-y">
                {a.attention.trials_ending.map((t) => (
                  <li key={t.school.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <Link href={`/schools/${t.school.id}`} className="truncate font-medium hover:underline">{t.school.name}</Link>
                    <ToneBadge tone={(t.days_left ?? 9) <= 2 ? "danger" : "warning"} label={t.days_left === 0 ? "hoje" : `${t.days_left} dia(s)`} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Pagamentos em atraso" description="Vencidas e em tolerância" icon="CircleAlert">
            {a.attention.past_due.length === 0 ? (
              <Empty text="Nenhuma subscrição em atraso." />
            ) : (
              <ul className="divide-y">
                {a.attention.past_due.map((s) => (
                  <li key={s.school.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <div className="min-w-0">
                      <Link href={`/schools/${s.school.id}`} className="block truncate font-medium hover:underline">{s.school.name}</Link>
                      <p className="text-xs text-muted-foreground">{s.plan} · {kz(s.monthly_amount)}/mês · venceu {day(s.period_end)}</p>
                    </div>
                    <ToneBadge tone="danger" label={`${s.days_overdue ?? 0} d`} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      {a && (
        <Panel title="Actividade recente" description="O que foi feito na plataforma" icon="History" action={<Button asChild size="sm" variant="ghost"><Link href="/security?tab=auditoria">Auditoria completa</Link></Button>}>
          {a.recent_activity.length === 0 ? (
            <Empty text="Sem actividade." />
          ) : (
            <ul className="divide-y">
              {a.recent_activity.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p><span className="font-medium">{e.actor}</span> <span className="text-muted-foreground">{ACTION_LABEL[e.action] ?? e.action} {ENTITY_LABEL[e.entity_type] ?? e.entity_type}{e.school ? ` · ${e.school}` : ""}</span></p>
                    {e.reason && <p className="truncate text-xs text-muted-foreground">{e.reason}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{since(e.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
