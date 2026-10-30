"use client";

import {
  MetricGrid,
  ScrollArea,
  ScrollBar,
  StackedBarPanel,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToneBadge,
  type Column,
} from "@workspace/ui";
import { formatDateTime, formatHours, formatPercent } from "@/lib/format";
import type { MemberListKey, MemberSnapshot, ReportListItem } from "@/types/report";
import { ReportTable } from "./report-table";

const LISTS: { key: MemberListKey; label: string; empty: string }[] = [
  { key: "completed", label: "Concluídas", empty: "Nenhuma actividade concluída nesta semana" },
  { key: "inProgress", label: "Em curso", empty: "Nada em curso" },
  { key: "overdue", label: "Atrasadas", empty: "Sem actividades atrasadas" },
  { key: "blocked", label: "Bloqueadas", empty: "Sem actividades bloqueadas" },
  { key: "nextWeek", label: "Próxima semana", empty: "Nada a vencer na próxima semana" },
];

const COLUMNS: Column<ReportListItem>[] = [
  { key: "title", header: "Actividade" },
  { key: "dueAt", header: "Prazo", render: (v) => formatDateTime(v) },
  {
    key: "completedAt",
    header: "Concluída",
    render: (v) => (v ? formatDateTime(v) : "—"),
  },
  {
    key: "onTime",
    header: "No prazo",
    render: (v) =>
      v === null || v === undefined ? "—" : <ToneBadge label={v ? "Sim" : "Não"} tone={v ? "success" : "danger"} />,
  },
  {
    key: "daysLate",
    header: "Atraso",
    render: (v) => (v ? `${v} ${v === 1 ? "dia" : "dias"}` : "—"),
  },
];

export function MemberReportView({ snapshot }: { snapshot: MemberSnapshot }) {
  const m = snapshot.metrics;
  return (
    <>
      <MetricGrid
        items={[
          {
            title: m.completed,
            subtitle: "Concluídas",
            description: `${formatPercent(m.onTimeRate)} dentro do prazo`,
            icon: "CircleCheck",
          },
          { title: m.inProgress, subtitle: "Em curso", description: `${m.blocked} bloqueadas`, icon: "Loader" },
          {
            title: m.overdue,
            subtitle: "Atrasadas",
            icon: "CalendarX",
            colors: m.overdue > 0 ? "destructive" : "default",
            variant: m.overdue > 0 ? "action" : "default",
          },
          { title: formatHours(m.avgCycleHours), subtitle: "Tempo médio de ciclo", description: "Início a conclusão", icon: "Timer" },
        ]}
      />

      <StackedBarPanel
        title="Distribuição das actividades"
        description={`${snapshot.member.name} · ${m.created} criadas, ${m.comments} comentários, ${m.documentsCreated} documentos criados`}
        icon="ChartBar"
        segments={[
          { key: "completed", label: "Concluídas", value: m.completed },
          { key: "inProgress", label: "Em curso", value: m.inProgress },
          { key: "blocked", label: "Bloqueadas", value: m.blocked },
          { key: "overdue", label: "Atrasadas", value: m.overdue },
        ]}
        emptyText="Sem actividade registada nesta semana."
      />

      <Tabs defaultValue="completed">
        <ScrollArea>
          <TabsList>
            {LISTS.map((l) => (
              <TabsTrigger key={l.key} value={l.key}>
                {l.label} ({snapshot.totals[l.key]})
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {LISTS.map((l) => (
          <TabsContent key={l.key} value={l.key}>
            <ReportTable data={snapshot.lists[l.key]} columns={COLUMNS} emptyTitle={l.empty} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
