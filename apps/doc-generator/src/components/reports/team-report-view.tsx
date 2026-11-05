"use client";

import { BarListPanel, MetricGrid, ToneBadge, type Column } from "@workspace/ui";
import { formatDateTime, formatHours, formatPercent } from "@/lib/format";
import type { ReportListItem, TeamMemberRow, TeamSnapshot } from "@/types/report";
import { ReportTable } from "./report-table";
import { SectionBlock } from "@/components/common/section-block";

const MEMBER_COLUMNS: Column<TeamMemberRow>[] = [
  { key: "name", header: "Membro" },
  { key: "completed", header: "Concluídas" },
  { key: "onTimeRate", header: "No prazo", render: (v) => formatPercent(v) },
  { key: "inProgress", header: "Em curso" },
  { key: "blocked", header: "Bloqueadas" },
  {
    key: "overdue",
    header: "Atrasadas",
    render: (v) => (v > 0 ? <ToneBadge label={String(v)} tone="danger" /> : "0"),
  },
  {
    key: "idle",
    header: "Estado",
    render: (v) => <ToneBadge label={v ? "Sem atividade" : "Ativo"} tone={v ? "warning" : "success"} />,
  },
];

const OVERDUE_COLUMNS: Column<ReportListItem>[] = [
  { key: "title", header: "Atividade" },
  {
    key: "assignees",
    header: "Responsáveis",
    render: (v: string[] | undefined) => (v?.length ? v.join(", ") : "Sem responsável"),
  },
  { key: "dueAt", header: "Prazo", render: (v) => formatDateTime(v) },
  { key: "daysLate", header: "Atraso", render: (v) => (v ? `${v} ${v === 1 ? "dia" : "dias"}` : "—") },
];

export function TeamReportView({ snapshot }: { snapshot: TeamSnapshot }) {
  const t = snapshot.totals;

  return (
    <div className="space-y-8">
      {/* Indicadores Globais da Equipa */}
      <MetricGrid
        items={[
          {
            title: t.completed,
            subtitle: "Concluídas",
            description: `${formatPercent(t.onTimeRate)} dentro do prazo`,
            icon: "CircleCheck",
          },
          {
            title: t.inProgress,
            subtitle: "Em curso e revisão",
            description: `${t.blocked} bloqueadas • ${t.unassignedOpen} sem responsável`,
            icon: "Loader",
          },
          {
            title: t.overdue,
            subtitle: "Atrasadas",
            icon: "CalendarX",
            colors: t.overdue > 0 ? "destructive" : "default",
            variant: t.overdue > 0 ? "action" : "default",
          },
          {
            title: formatHours(t.avgCycleHours),
            subtitle: "Tempo médio de ciclo",
            description: `${t.created} criadas na semana`,
            icon: "Timer",
          },
        ]}
      />

      {/* Gráficos de Desempenho e Tendência Lado a Lado (sem cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarListPanel
          title="Concluídas por membro"
          description="Atividades concluídas na semana"
          icon="Users"
          items={snapshot.members.map((m) => ({ label: m.name, value: m.completed }))}
          multicolor
          seriesLabel="Concluídas"
          className="border-0 bg-transparent p-0 shadow-none"
          emptyText="Nenhuma atividade concluída nesta semana."
        />

        <BarListPanel
          title="Tendência de 4 semanas"
          description="Atividades concluídas por semana"
          icon="TrendingUp"
          orientation="vertical"
          items={snapshot.trend.map((x) => ({ label: `Até ${x.weekEnd.slice(5, 10)}`, value: x.completed }))}
          seriesLabel="Concluídas"
          className="border-0 bg-transparent p-0 shadow-none"
        />
      </div>

      {/* Tabela de Membros da Equipa Sem Card Envolvente */}
      <SectionBlock
        title="Desempenho da Equipa"
        description="Quadro consolidado de taxas de entrega no prazo, tarefas em curso e atrasos"
        icon="Users"
      >
        <ReportTable data={snapshot.members} columns={MEMBER_COLUMNS} emptyTitle="Sem membros na equipa" />
      </SectionBlock>

      {/* Tabela de Atrasadas em Aberto */}
      {snapshot.overdueTop.length > 0 && (
        <SectionBlock
          title="Atrasadas em aberto"
          description="As atividades com maior número de dias em atraso"
          icon="CalendarX"
        >
          <ReportTable
            data={snapshot.overdueTop}
            columns={OVERDUE_COLUMNS}
            emptyTitle="Sem atividades atrasadas"
          />
        </SectionBlock>
      )}
    </div>
  );
}
