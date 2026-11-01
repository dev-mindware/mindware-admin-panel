"use client";

import { parseAsString, useQueryState } from "nuqs";
import {
  Button,
  EmptyState,
  Icon,
  ListSkeleton,
  PageWrapper,
  RequestError,
  Tabs,
  TabsList,
  TabsTrigger,
  TitleList,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

      {/* Barra de Filtros Canónica Clean MindSchool: sem card, sem caixa cinzenta */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Semana */}
          <div className="w-full sm:w-72">
            <Select value={week || "latest"} onValueChange={(v) => void setWeek(v === "latest" ? null : v)}>
              <SelectTrigger className="h-10 bg-background">
                <div className="flex items-center gap-2 truncate">
                  <Icon name="Calendar" className="size-4 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Mais recente" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Mais recente (semana ativa)</SelectItem>
                {(weeks.data ?? []).map((w) => (
                  <SelectItem key={w.weekEnd} value={w.weekEnd}>
                    {formatWindow(w.weekStart, w.weekEnd)} (até {formatDate(w.weekEnd)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Membro (apenas para Gestores na vista individual) */}
          {isManager && view === "member" && (
            <div className="w-full sm:w-64">
              <Select value={member || "all"} onValueChange={(v) => void setMember(v === "all" ? null : v)}>
                <SelectTrigger className="h-10 bg-background">
                  <div className="flex items-center gap-2 truncate">
                    <Icon name="User" className="size-4 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="O meu relatório" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">O meu relatório</SelectItem>
                  {(team.data?.snapshot.members ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(week || member) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                void setWeek(null);
                void setMember(null);
              }}
              className="h-10 text-xs text-destructive hover:text-destructive"
            >
              <Icon name="X" className="w-3.5 h-3.5 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>

        {isManager && (
          <Tabs value={view} onValueChange={(v) => void setTab(v === "team" ? null : v)} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto grid grid-cols-2">
              <TabsTrigger value="team">Equipa</TabsTrigger>
              <TabsTrigger value="member">Membro</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

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
