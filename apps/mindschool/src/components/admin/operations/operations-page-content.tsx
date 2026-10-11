"use client";

import { Badge, Button, ConfirmModal, GenericTable, Icon, MetricGrid, Panel, TitleList, ToneBadge, type Column } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useState } from "react";
import { PermissionGate } from "@/components/admin/shared/permission-gate";
import { useLocalPage } from "@/hooks/use-local-page";
import { useFailedJobs, useOpsActions, useOutbox, usePlatformOverview, useQueues, useStorage } from "@/hooks/ops/use-ops";
import { getApiErrorMessage } from "@/utils/api-error";
import { dateTime } from "@/utils/format";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { DeadLetter, QueueStat } from "@/types/directory";

const PURGE_MODAL = "storage-purge";
const BACKFILL_MODAL = "storage-backfill";
const mb = (bytes: number) => (bytes >= 1_073_741_824 ? `${(bytes / 1_073_741_824).toFixed(1)} GB` : `${(bytes / 1_048_576).toFixed(1)} MB`);

function FailedJobs({ queue }: { queue: string }) {
  const q = useFailedJobs(queue);
  const { retryJob } = useOpsActions();
  const jobs = q.data ?? [];
  if (q.isLoading) return <p className="text-sm text-muted-foreground">A carregar…</p>;
  if (jobs.length === 0) return <p className="py-3 text-center text-sm text-muted-foreground">Sem trabalhos falhados nesta fila.</p>;
  return (
    <ul className="divide-y rounded-lg border">
      {jobs.map((j) => (
        <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
          <div className="min-w-0">
            <p className="font-medium">{j.name} <span className="text-xs text-muted-foreground">· {j.attempts} tentativa(s)</span></p>
            <p className="max-w-xl truncate text-xs text-destructive" title={j.reason}>{j.reason}</p>
            <p className="text-[11px] text-muted-foreground">{dateTime(j.failed_at)}</p>
          </div>
          <Button size="sm" variant="outline" loading={retryJob.isPending} onClick={() => j.id && retryJob.mutate({ queue, jobId: j.id }, { onSuccess: () => SuccessMessage("Trabalho reenfileirado."), onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível repetir.")) })}>
            Repetir
          </Button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Operações da plataforma (C2): saúde das filas, outbox e dead-letter, facturação fiscal, relatórios falhados e armazenamento,
 * com «repetir» e «arquivar» sem sair do ecrã. Actualiza sozinha a cada minuto.
 */
export function OperationsPageContent() {
  const overview = usePlatformOverview();
  const queues = useQueues();
  const { stats: outbox, dead } = useOutbox();
  const storage = useStorage();
  const { requeue, purge, backfill } = useOpsActions();
  const { openModal } = useModalStore();
  const [openQueue, setOpenQueue] = useState<string | null>(null);

  const n = overview.data?.needs_attention;
  const failedJobs = (queues.data?.data ?? []).reduce((a, x) => a + x.failed, 0);
  const objects = (storage.data?.data ?? []).filter((x) => x.status === "disponivel");
  const totalBytes = objects.reduce((a, x) => a + x.bytes, 0);
  const deadPage = useLocalPage(dead.data ?? [], 8);

  const queueColumns: Column<QueueStat & { id: string }>[] = [
    { key: "queue", header: "Fila", render: (_, x) => <span className="font-mono text-sm font-medium">{x.queue}</span> },
    { key: "waiting", header: "À espera", render: (_, x) => <span className="tabular-nums">{x.waiting}</span> },
    { key: "active", header: "Activos", render: (_, x) => <span className="tabular-nums">{x.active}</span> },
    { key: "delayed", header: "Agendados", render: (_, x) => <span className="tabular-nums">{x.delayed}</span> },
    { key: "failed", header: "Falhados", render: (_, x) => <ToneBadge tone={x.failed > 0 ? "danger" : "neutral"} label={String(x.failed)} /> },
    { key: "completed", header: "Concluídos", render: (_, x) => <span className="tabular-nums text-muted-foreground">{x.completed}</span> },
    { key: "a", header: "", render: (_, x) => (x.failed > 0 ? <Button size="sm" variant="outline" onClick={() => setOpenQueue(openQueue === x.queue ? null : x.queue)}>{openQueue === x.queue ? "Esconder" : "Ver falhados"}</Button> : null) },
  ];
  const queueRows = (queues.data?.data ?? []).map((x) => ({ ...x, id: x.queue }));
  const queuePage = useLocalPage(queueRows, 10);

  const deadColumns: Column<DeadLetter>[] = [
    { key: "type", header: "Evento", render: (_, d) => <span className="font-mono text-xs font-medium">{d.type}</span> },
    { key: "attempts", header: "Tentativas", render: (_, d) => <span className="tabular-nums">{d.attempts}</span> },
    { key: "error", header: "Último erro", render: (_, d) => <span className="line-clamp-2 max-w-md text-xs text-destructive" title={d.last_error ?? ""}>{d.last_error ?? "—"}</span> },
    { key: "when", header: "Ocorreu", render: (_, d) => <span className="text-xs">{dateTime(d.occurred_at)}</span> },
    {
      key: "a",
      header: "Acção",
      render: (_, d) => (
        <Button size="sm" variant="outline" loading={requeue.isPending} onClick={() => requeue.mutate(d.id, { onSuccess: () => SuccessMessage("Evento reenfileirado."), onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível reenfileirar.")) })}>
          Reenfileirar
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <TitleList title="Operações" suTitle="A saúde técnica da plataforma. Se algo estiver a falhar, vê-se aqui em segundos e resolve-se sem sair do ecrã.">
        <Button size="sm" variant="outline" className="gap-2" onClick={() => { void overview.refetch(); void queues.refetch(); void outbox.refetch(); void dead.refetch(); void storage.refetch(); }}>
          <Icon name="RefreshCw" className="size-4" />
          Actualizar
        </Button>
      </TitleList>

      <MetricGrid
        isLoading={overview.isLoading && !n}
        isError={overview.isError}
        onRetry={() => void overview.refetch()}
        items={[
          { title: outbox.data?.pending ?? "—", subtitle: "Outbox por entregar", description: `${outbox.data?.processed ?? 0} entregues`, icon: "Inbox" },
          { title: outbox.data?.dead_letter ?? n?.dead_letter_events ?? 0, subtitle: "Dead-letter", description: "Eventos que esgotaram as tentativas", icon: "MailX", variant: (outbox.data?.dead_letter ?? 0) > 0 ? "action" : "default", colors: "destructive" },
          { title: failedJobs, subtitle: "Trabalhos falhados", description: `Filas em modo ${queues.data?.mode ?? "—"}`, icon: "ListX", variant: failedJobs > 0 ? "action" : "default", colors: "destructive" },
          { title: n?.fiscal_submissions_pending ?? 0, subtitle: "Fiscal pendente", description: "A aguardar o MindGest", icon: "FileClock" },
          { title: n?.fiscal_submissions_failed ?? 0, subtitle: "Fiscal rejeitado", description: "Precisam de correcção", icon: "FileX", variant: (n?.fiscal_submissions_failed ?? 0) > 0 ? "action" : "default", colors: "destructive" },
          { title: n?.failed_report_jobs_24h ?? 0, subtitle: "Relatórios falhados", description: "Últimas 24 horas", icon: "FileWarning" },
          { title: mb(totalBytes), subtitle: "Armazenamento", description: `${objects.reduce((a, x) => a + x.objects, 0)} ficheiro(s) · ${storage.data?.driver ?? "—"}`, icon: "HardDrive" },
          { title: n?.past_due_or_grace_subscriptions ?? 0, subtitle: "Subscrições em atraso", description: "Vencidas ou em tolerância", icon: "CircleAlert" },
        ]}
        skeletons={8}
      />

      <Panel title="Filas de trabalhos" description="Processamento em segundo plano (relatórios, emails, calendário, facturação…)" icon="Layers">
        {queues.data?.mode === "inline" && <p className="mb-3 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">As filas correm no processo da API (sem Redis): não há contadores nem trabalhos para repetir.</p>}
        <GenericTable<QueueStat & { id: string }> data={queuePage.rows} columns={queueColumns} page={queuePage.page} total={queuePage.total} totalPages={queuePage.totalPages} setPage={queuePage.setPage} goToNextPage={queuePage.goToNextPage} goToPreviousPage={queuePage.goToPreviousPage} emptyTitle="Sem filas" emptyDescription="Nenhuma fila registada." emptyIcon="Layers" />
        {openQueue && <div className="mt-4"><p className="mb-2 text-sm font-medium">Falhados em <span className="font-mono">{openQueue}</span></p><FailedJobs queue={openQueue} /></div>}
      </Panel>

      <Panel title="Eventos em dead-letter" description="Entregas que esgotaram as tentativas. Reenfileirar volta a tentar do zero." icon="MailX">
        <GenericTable<DeadLetter> data={deadPage.rows} columns={deadColumns} page={deadPage.page} total={deadPage.total} totalPages={deadPage.totalPages} setPage={deadPage.setPage} goToNextPage={deadPage.goToNextPage} goToPreviousPage={deadPage.goToPreviousPage} emptyTitle="Dead-letter vazio" emptyDescription="Nenhum evento falhado." emptyIcon="CircleCheck" />
      </Panel>

      <Panel
        title="Armazenamento"
        description="Ficheiros guardados (comprovativos, relatórios…) e limpeza dos expirados"
        icon="HardDrive"
        action={
          <PermissionGate permission="platform:storage_manage">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openModal(BACKFILL_MODAL)}>Migrar legado</Button>
              <Button size="sm" variant="outline" onClick={() => openModal(PURGE_MODAL)}>Limpar expirados</Button>
            </div>
          </PermissionGate>
        }
      >
        {(storage.data?.data ?? []).length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">Sem ficheiros.</p> : (
          <ul className="divide-y">
            {(storage.data?.data ?? []).map((x) => (
              <li key={`${x.domain}-${x.status}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="flex items-center gap-2"><span className="font-mono text-xs">{x.domain}</span><Badge variant={x.status === "disponivel" ? "success" : "secondary"} className="text-[10px]">{x.status}</Badge></span>
                <span className="text-muted-foreground">{x.objects} ficheiro(s) · {mb(x.bytes)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <ConfirmModal
        id={PURGE_MODAL}
        title="Limpar ficheiros expirados"
        description="Apaga do armazenamento os ficheiros com a retenção vencida e os uploads pendentes há mais de 24 h. Não afecta ficheiros dentro do prazo."
        destructive
        confirmLabel="Limpar"
        onConfirm={async () => {
          try {
            const r = await purge.mutateAsync();
            SuccessMessage(`${r.expired} expirado(s) e ${r.orphans} órfão(s) removido(s)${r.failed ? `, ${r.failed} falha(s)` : ""}.`);
          } catch (e) {
            ErrorMessage(getApiErrorMessage(e, "Não foi possível limpar."));
            throw e;
          }
        }}
      />
      <ConfirmModal
        id={BACKFILL_MODAL}
        title="Migrar comprovativos legados"
        description="Move para o armazenamento de objectos os comprovativos e relatórios que ainda estão na base de dados (em lotes; idempotente)."
        confirmLabel="Migrar"
        onConfirm={async () => {
          try {
            const r = await backfill.mutateAsync();
            SuccessMessage(`${r.payment_proofs} comprovativo(s) e ${r.report_jobs} relatório(s) migrado(s)${r.failed ? `, ${r.failed} falha(s)` : ""}.`);
          } catch (e) {
            ErrorMessage(getApiErrorMessage(e, "Não foi possível migrar."));
            throw e;
          }
        }}
      />
    </div>
  );
}
