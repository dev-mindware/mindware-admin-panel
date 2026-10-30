"use client";

import { BarListPanel, MetricGrid, Panel, ToneBadge, type Column } from "@workspace/ui";
import { formatDateTime, formatDayMonth, formatHours, formatPercent } from "@/lib/format";
import type { ReportListItem, TeamMemberRow, TeamSnapshot } from "@/types/report";
import { ReportTable } from "./report-table";

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
    render: (v) => <ToneBadge label={v ? "Sem actividade" : "Activo"} tone={v ? "warning" : "success"} />,
  },
];

const OVERDUE_COLUMNS: Column<ReportListItem>[] = [
  { key: "title", header: "Actividade" },
  { key: "assignees", header: "Responsáveis", render: (v: string[] | undefined) => (v?.length ? v.join(", ") : "Sem responsável") },
  { key: "dueAt", header: "Prazo", render: (v) => formatDateTime(v) },
  { key: "daysLate", header: "Atraso", render: (v) => (v ? `${v} ${v === 1 ? "dia" : "dias"}` : "—") },
];

export function TeamReportView({ snapshot }: { snapshot: TeamSnapshot }) {
  const t = snapshot.totals;
  return (
    <>
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
            description: `${t.blocked} bloqueadas · ${t.unassignedOpen} sem responsável`,
            icon: "Loader",
          },
          {
            title: t.overdue,
            subtitle: "Atrasadas",
            icon: "CalendarX",
            colors: t.overdue > 0 ? "destructive" : "default",
            variant: t.overdue > 0 ? "action" : "default",
          },
          { title: formatHours(t.avgCycleHours), subtitle: "Tempo médio de ciclo", description: `${t.created} criadas`, icon: "Timer" },
        ]}
      />

      <BarListPanel
        title="Concluídas por membro"
        description="Actividades concluídas na semana"
        icon="Users"
        items={snapshot.members.map((m) => ({ label: m.name, value: m.completed }))}
        multicolor
        seriesLabel="Concluídas"
        emptyText="Nenhuma actividade concluída nesta semana."
      />

      <BarListPanel
        title="Tendência de 4 semanas"
        description="Concluídas por semana (até à data indicada)"
        icon="TrendingUp"
        orientation="vertical"
        items={snapshot.trend.map((x) => ({ label: `até ${formatDayMonth(x.weekEnd)}`, value: x.completed }))}
        seriesLabel="Concluídas"
      />

      <Panel title="Equipa" description="Resumo por membro" icon="Users">
        <ReportTable data={snapshot.members} columns={MEMBER_COLUMNS} emptyTitle="Sem membros" />
      </Panel>

      <Panel title="Atrasadas em aberto" description="As 10 mais antigas" icon="CalendarX">
        <ReportTable
          data={snapshot.overdueTop}
          columns={OVERDUE_COLUMNS}
          emptyTitle="Sem actividades atrasadas"
        />
      </Panel>
    </>
  );
}
