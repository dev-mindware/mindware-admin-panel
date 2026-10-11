"use client";

import { useState } from "react";
import { Badge, ButtonOnlyAction, FilterToolbar, GenericTable, ListSkeleton, ConfirmModal, MetricGrid, StatusBadge, TitleList, type Column } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useImpersonationActions, useImpersonations } from "@/hooks/directory/use-directory";
import { useLocalPage } from "@/hooks/use-local-page";
import { getApiErrorMessage } from "@/utils/api-error";
import { dateTime } from "@/utils/format";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { AdminImpersonation } from "@/types/directory";

const REVOKE_MODAL = "impersonation-revoke";
const STATE = { activa: { label: "Activa", tone: "success" }, terminada: { label: "Terminada", tone: "neutral" }, expirada: { label: "Expirada", tone: "neutral" } } as const;

const stateOf = (i: AdminImpersonation) => (i.active ? "activa" : i.revoked_at ? "terminada" : "expirada");
const minutes = (i: AdminImpersonation) => Math.max(0, Math.round(((i.revoked_at ? new Date(i.revoked_at) : new Date(i.expires_at)).getTime() - new Date(i.started_at).getTime()) / 60_000));

/** Registo das personificações (activas e passadas): quem assumiu quem, onde, porquê, em que modo, e revogação imediata. */
export function ImpersonationsPageContent() {
  const q = useImpersonations();
  const { revoke } = useImpersonationActions();
  const { openModal } = useModalStore();
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [mode, setMode] = useState("");

  const all = q.data ?? [];
  const rows = all.filter((i) => {
    const text = `${i.admin?.full_name ?? ""} ${i.admin?.email ?? ""} ${i.target?.full_name ?? ""} ${i.target?.email ?? ""} ${i.school?.name ?? ""} ${i.reason}`.toLowerCase();
    return (!search || text.includes(search.toLowerCase())) && (!state || stateOf(i) === state) && (!mode || i.mode === mode);
  });
  const page = useLocalPage(rows, 10, `${search}|${state}|${mode}`);

  const [now] = useState(() => Date.now());
  const month = now - 30 * 86_400_000;
  const recent = all.filter((i) => new Date(i.started_at).getTime() >= month);
  const avg = recent.length ? Math.round(recent.reduce((a, i) => a + minutes(i), 0) / recent.length) : 0;

  const columns: Column<AdminImpersonation>[] = [
    { key: "admin", header: "Administrador", render: (_, i) => <div><p className="text-sm font-medium">{i.admin?.full_name ?? "—"}</p><p className="text-xs text-muted-foreground">{i.admin?.email}</p></div> },
    { key: "target", header: "Personificou", render: (_, i) => <div><p className="text-sm font-medium">{i.target?.full_name ?? "—"}</p><p className="text-xs text-muted-foreground">{i.target?.email} · {i.school?.name}</p></div> },
    { key: "reason", header: "Motivo", render: (_, i) => <span className="line-clamp-2 max-w-xs text-xs" title={i.reason}>{i.reason}</span> },
    { key: "mode", header: "Modo", render: (_, i) => <Badge variant={i.mode === "escrita" ? "pending" : "secondary"}>{i.mode === "escrita" ? "Escrita" : "Leitura"}</Badge> },
    { key: "period", header: "Período", render: (_, i) => <span className="text-xs">{dateTime(i.started_at)}<br />{minutes(i)} min</span> },
    { key: "state", header: "Estado", render: (_, i) => <StatusBadge status={stateOf(i)} map={STATE} /> },
    { key: "actions", header: "Acção", render: (_, i) => (i.active ? <ButtonOnlyAction data={i} actions={[{ label: "Revogar agora", icon: "Ban", variant: "destructive", onClick: (x) => openModal(REVOKE_MODAL, x) }]} /> : null) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <TitleList title="Personificações" suTitle="Todas as vezes que alguém da plataforma assumiu a identidade de um utilizador. Cada uma tem motivo, duração máxima de 30 minutos e fica na auditoria da escola. Para iniciar uma, use Utilizadores › Personificar." />

      <MetricGrid
        isLoading={q.isLoading}
        isError={q.isError}
        onRetry={() => void q.refetch()}
        items={[
          { title: all.filter((i) => i.active).length, subtitle: "Activas agora", description: "Podem ser revogadas", icon: "UserCog", variant: all.some((i) => i.active) ? "action" : "default" },
          { title: recent.length, subtitle: "Nos últimos 30 dias", description: `${all.length} no registo`, icon: "CalendarDays" },
          { title: recent.filter((i) => i.mode === "escrita").length, subtitle: "Com escrita", description: "Últimos 30 dias", icon: "Pencil", colors: "destructive", variant: recent.some((i) => i.mode === "escrita") ? "action" : "default" },
          { title: `${avg} min`, subtitle: "Duração média", description: "Últimos 30 dias", icon: "Timer" },
        ]}
      />

      <div className="space-y-4">
        <FilterToolbar
          search={{ value: search, onChange: setSearch, placeholder: "Pesquisar por administrador, utilizador, escola ou motivo…" }}
          filters={[
            { key: "state", label: "Estado", value: state, onChange: setState, options: Object.entries(STATE).map(([value, v]) => ({ value, label: v.label })) },
            { key: "mode", label: "Modo", value: mode, onChange: setMode, options: [{ value: "leitura", label: "Leitura" }, { value: "escrita", label: "Escrita" }] },
          ]}
          onClear={() => { setSearch(""); setState(""); setMode(""); }}
        />
        {q.isLoading ? <ListSkeleton cols={6} rows={4} /> : (
          <GenericTable<AdminImpersonation> data={page.rows} columns={columns} page={page.page} total={page.total} totalPages={page.totalPages} setPage={page.setPage} goToNextPage={page.goToNextPage} goToPreviousPage={page.goToPreviousPage} emptyTitle="Sem personificações" emptyDescription="Ainda ninguém assumiu a identidade de um utilizador." emptyIcon="UserCog" />
        )}
      </div>

      <ConfirmModal<AdminImpersonation>
        id={REVOKE_MODAL}
        title="Revogar personificação"
        description={(i) => (i ? `A sessão de ${i.admin?.full_name ?? "administrador"} como ${i.target?.full_name ?? "utilizador"} termina imediatamente.` : undefined)}
        destructive
        confirmLabel="Revogar"
        onConfirm={async (i) => {
          if (!i) return;
          try {
            await revoke.mutateAsync(i.id);
            SuccessMessage("Personificação revogada.");
          } catch (e) {
            ErrorMessage(getApiErrorMessage(e, "Não foi possível revogar."));
            throw e;
          }
        }}
      />
    </div>
  );
}
