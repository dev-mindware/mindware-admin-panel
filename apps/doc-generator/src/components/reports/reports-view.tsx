"use client";

import { parseAsString, useQueryState } from "nuqs";
import {
  Button,
  EmptyState,
  FilterToolbar,
  Icon,
  ListSkeleton,
  PageWrapper,
  RequestError,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TitleList,
} from "@workspace/ui";
import {
  isReportMissing,
  useDownloadPdf,
  useGenerateReport,
  useMemberReport,
  useReportWeeks,
  useTeamReport,
} from "@/hooks/use-reports";
import { usePermissions } from "@/hooks/use-permissions";
import { formatDate, formatWindow } from "@/lib/format";
import { reportsService } from "@/services/reports-service";
import { MemberReportView } from "./member-report-view";
import { TeamReportView } from "./team-report-view";

export function ReportsView() {
  const { isAdmin, isManager } = usePermissions();
  const [week, setWeek] = useQueryState("week", parseAsString.withDefault(""));
  const [member, setMember] = useQueryState("member", parseAsString.withDefault(""));
  const [tab, setTab] = useQueryState("tab", parseAsString.withDefault(""));

  const weeks = useReportWeeks();
  const weekEnd = week || undefined;
  const team = useTeamReport(weekEnd, isManager);
  const memberReport = useMemberReport(weekEnd, member || undefined);
  const generate = useGenerateReport();
  const download = useDownloadPdf();

  const view = isManager && tab !== "member" ? "team" : "member";
  const active = view === "team" ? team : memberReport;
  const window = view === "team" ? team.data?.snapshot.window : memberReport.data?.snapshot.window;
  const stamp = (window?.end ?? weekEnd ?? "").slice(0, 10);

  function downloadPdf() {
    const params = { weekEnd: weekEnd ?? window?.end };
    download.mutate(() =>
      view === "team"
        ? reportsService.downloadTeamPdf(params, `relatorio-equipa-${stamp}.pdf`)
        : reportsService.downloadMemberPdf({ ...params, userId: member || undefined }, `relatorio-${stamp}.pdf`),
    );
  }

  const missing = isReportMissing(active.error);

  return (
    <PageWrapper routeLabel="Relatórios" subRoute="Relatório Semanal">
      <TitleList
        title="Relatório Semanal"
        suTitle="Concluídas, atrasadas e cumprimento de prazos. Gerado todos os sábados às 12:00 (hora de Luanda)"
      >
        {isAdmin && (
          <Button variant="outline" disabled={generate.isPending} onClick={() => generate.mutate({})}>
            <Icon name="RefreshCcw" />
            {generate.isPending ? "A gerar..." : "Gerar último relatório"}
          </Button>
        )}
        <Button disabled={!active.data || download.isPending} onClick={downloadPdf}>
          <Icon name="FileDown" />
          Descarregar PDF
        </Button>
      </TitleList>

      <FilterToolbar
        filters={[
          {
            key: "week",
            label: "Semana",
            value: week,
            onChange: (v) => void setWeek(v || null),
            placeholder: "Mais recente",
            options: (weeks.data ?? []).map((w) => ({
              label: `${formatWindow(w.weekStart, w.weekEnd)} (até ${formatDate(w.weekEnd)})`,
              value: w.weekEnd,
            })),
          },
          ...(isManager && view === "member"
            ? [
                {
                  key: "member",
                  label: "Membro",
                  value: member,
                  onChange: (v: string) => void setMember(v || null),
                  placeholder: "O meu relatório",
                  options: (team.data?.snapshot.members ?? []).map((m) => ({ label: m.name, value: m.id })),
                },
              ]
            : []),
        ]}
        onClear={() => {
          void setWeek(null);
          void setMember(null);
        }}
      />

      {isManager ? (
        <Tabs value={view} onValueChange={(v) => void setTab(v === "team" ? null : v)}>
          <TabsList>
            <TabsTrigger value="team">Equipa</TabsTrigger>
            <TabsTrigger value="member">Membro</TabsTrigger>
          </TabsList>
        </Tabs>
      ) : null}

      {active.isLoading ? (
        <ListSkeleton cols={4} rows={3} />
      ) : missing ? (
        <EmptyState
          icon="ChartColumn"
          title="Ainda não há relatório para esta semana"
          description="O relatório é gerado todos os sábados às 12:00. Um administrador pode gerar o último já agora."
        />
      ) : active.isError ? (
        <RequestError refetch={() => void active.refetch()} message="Não foi possível carregar o relatório." />
      ) : view === "team" && team.data ? (
        <TeamReportView snapshot={team.data.snapshot} />
      ) : memberReport.data ? (
        <MemberReportView snapshot={memberReport.data.snapshot} />
      ) : null}
    </PageWrapper>
  );
}
