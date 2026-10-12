"use client";

import { useEffect, useState } from "react";
import { Badge, BarListPanel, Button, ButtonOnlyAction, FilterToolbar, GaugePanel, GenericTable, GlobalModal, Icon, Input, ListSkeleton, MetricGrid, ReasonModal, StatusBadge, Tabs, TabsContent, TabsList, TabsTrigger, TitleList, type Column, type StatusMap } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { PermissionGate } from "@/components/admin/shared/permission-gate";
import { useEmailActions, useEmailLog, useEmailStats, useEmailTemplates } from "@/hooks/ops/use-ops";
import { useLocalPage } from "@/hooks/use-local-page";
import { emailService } from "@/services/ops-service";
import { getApiErrorMessage } from "@/utils/api-error";
import { dateTime } from "@/utils/format";
import { ErrorMessage, SuccessMessage, WarningMessage } from "@/utils/messages";
import type { EmailLogRow, EmailTemplate } from "@/types/directory";

const PREVIEW_MODAL = "email-preview";
const TEST_MODAL = "email-test";
const STATUS: StatusMap = { enviado: { label: "Enviado", tone: "success" }, falhou: { label: "Falhou", tone: "danger" }, pendente: { label: "Pendente", tone: "warning" }, ignorado: { label: "Ignorado", tone: "neutral" } };

function PreviewModal() {
  const { open, modalData, closeModal } = useModalStore();
  const isOpen = !!open[PREVIEW_MODAL];
  const t = modalData[PREVIEW_MODAL] as EmailTemplate | undefined;
  const q = useQuery({ queryKey: ["email-preview", t?.code], queryFn: () => emailService.preview(t!.code), enabled: isOpen && Boolean(t), retry: false });
  if (!isOpen) return null;
  return (
    <GlobalModal id={PREVIEW_MODAL} size="lg" title={t?.name ?? "Pré-visualização"} description={q.data?.subject} footer={<div className="flex justify-end"><Button variant="outline" onClick={() => closeModal(PREVIEW_MODAL)}>Fechar</Button></div>}>
      {q.isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">A carregar…</p> : q.data ? <iframe title="Pré-visualização do email" srcDoc={q.data.html} sandbox="" className="h-[60vh] w-full rounded-md border bg-white" /> : <p className="py-8 text-center text-sm text-destructive">Não foi possível carregar a pré-visualização.</p>}
    </GlobalModal>
  );
}

function TestModal() {
  const { open, modalData } = useModalStore();
  const isOpen = !!open[TEST_MODAL];
  const t = modalData[TEST_MODAL] as EmailTemplate | undefined;
  const { test } = useEmailActions();
  const [to, setTo] = useState("");
  useEffect(() => { if (isOpen) setTo(""); }, [isOpen]);
  return (
    <ReasonModal<EmailTemplate>
      id={TEST_MODAL}
      icon="Mail"
      title="Enviar email de teste"
      description={(x) => (x ? `Envia «${x.name}» com dados de exemplo.` : undefined)}
      minLength={0}
      confirmLabel="Enviar"
      onConfirm={async (_v, x) => {
        if (!x) return;
        try {
          if (!/^\S+@\S+\.\S+$/.test(to.trim())) throw new Error("Indique um email válido.");
          const r = await test.mutateAsync({ code: x.code, to: to.trim() });
          if (r.outcome === "sent") SuccessMessage(`Email de teste enviado a ${to.trim()}.`);
          else WarningMessage(`Não foi enviado (${r.outcome}).`);
        } catch (e) {
          ErrorMessage(getApiErrorMessage(e, "Não foi possível enviar."));
          throw e;
        }
      }}
    >
      {() => <Input label="Enviar para *" type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder={t ? "email@exemplo.ao" : ""} />}
    </ReasonModal>
  );
}

/** Centro de emails: indicadores de entrega, registo global com erros, catálogo de modelos (pré-visualizar e testar) e o ciclo diário de automação. */
export function CommunicationPageContent() {
  const stats = useEmailStats();
  const templates = useEmailTemplates();
  const { run } = useEmailActions();
  const { openModal } = useModalStore();
  const [tab, setTab] = useQueryState("tab", { defaultValue: "registo" });
  const [status, setStatus] = useQueryState("estado", { defaultValue: "" });
  const [template, setTemplate] = useQueryState("modelo", { defaultValue: "" });
  const [search, setSearch] = useQueryState("dest", { defaultValue: "" });
  const log = useEmailLog({ ...(status ? { status } : {}), ...(template ? { template } : {}), ...(search.length >= 3 ? { q: search } : {}) });
  const logPage = useLocalPage(log.data ?? [], 10, `${status}|${template}|${search}`);
  const tplPage = useLocalPage(templates.data?.data ?? [], 10);
  const s = stats.data;

  const logColumns: Column<EmailLogRow>[] = [
    { key: "when", header: "Quando", render: (_, r) => <span className="text-xs">{dateTime(r.created_at)}</span> },
    { key: "to", header: "Destinatário", render: (_, r) => <span className="text-sm">{r.recipient}</span> },
    { key: "tpl", header: "Modelo", render: (_, r) => <span className="font-mono text-xs">{r.template_code}</span> },
    { key: "subject", header: "Assunto", render: (_, r) => <span className="line-clamp-1 max-w-xs text-xs text-muted-foreground" title={r.subject}>{r.subject}</span> },
    { key: "status", header: "Estado", render: (_, r) => <div className="space-y-0.5"><StatusBadge status={r.status} map={STATUS} />{r.error && <p className="max-w-[200px] truncate text-[11px] text-destructive" title={r.error}>{r.error}</p>}</div> },
    { key: "attempts", header: "Tentativas", render: (_, r) => <span className="tabular-nums text-xs">{r.attempts}</span> },
  ];

  const tplColumns: Column<EmailTemplate & { id: string }>[] = [
    { key: "name", header: "Modelo", render: (_, t) => <div><p className="text-sm font-medium">{t.name}</p><p className="font-mono text-[11px] text-muted-foreground">{t.code}</p></div> },
    { key: "description", header: "Quando se envia", render: (_, t) => <span className="max-w-md text-xs text-muted-foreground">{t.description}</span> },
    { key: "category", header: "Categoria", render: (_, t) => <Badge variant="secondary" className="text-[10px]">{templates.data?.categories[t.category] ?? t.category}</Badge> },
    { key: "essential", header: "", render: (_, t) => (t.essential ? <Badge variant="outline" className="text-[10px]">Essencial</Badge> : null) },
    {
      key: "a",
      header: "Acção",
      render: (_, t) => (
        <ButtonOnlyAction data={t} actions={[{ label: "Pré-visualizar", icon: "Eye", onClick: (x) => openModal(PREVIEW_MODAL, x) }, { label: "Enviar teste", icon: "Send", onClick: (x) => openModal(TEST_MODAL, x) }]} />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <TitleList title="Comunicação" suTitle="Os emails que a plataforma envia: entrega, falhas e modelos.">
        <PermissionGate permission="platform:email">
          <Button size="sm" variant="outline" className="gap-2" loading={run.isPending} onClick={() => run.mutate(undefined, { onSuccess: () => SuccessMessage("Ciclo diário executado e falhas reenviadas."), onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível executar.")) })}>
            <Icon name="Play" className="size-4" />
            Correr automação agora
          </Button>
        </PermissionGate>
      </TitleList>

      <MetricGrid
        isLoading={stats.isLoading}
        isError={stats.isError}
        onRetry={() => void stats.refetch()}
        items={
          s
            ? [
                { title: s.sent, subtitle: "Enviados", description: `Últimos ${s.window_days} dias`, icon: "MailCheck" },
                { title: s.failed, subtitle: "Falhados", description: "Precisam de atenção", icon: "MailX", variant: s.failed > 0 ? "action" : "default", colors: "destructive", onClick: () => { void setStatus("falhou"); void setTab("registo"); } },
                                { title: s.delivery_rate === null ? "—" : `${s.delivery_rate}%`, subtitle: "Taxa de entrega", description: s.pending ? `${s.pending} pendente(s) · ${s.skipped} ignorado(s)` : "Sem envios pendentes", icon: "Gauge" },
              ]
            : []
        }
      />
      {s && (
        <div className="grid gap-4 md:grid-cols-2">
          <GaugePanel title="Taxa de entrega" description={`Últimos ${s.window_days} dias`} icon="Gauge" percent={s.delivery_rate} caption={`${s.sent} enviados · ${s.failed} falhados`} warnBelow={90} />
          <BarListPanel title="Modelos mais enviados" description={`Últimos ${s.window_days} dias`} icon="Mail" items={s.top_templates.slice(0, 5).map((t) => ({ label: t.template_code, value: t.total }))} emptyText="Sem envios no período." />
        </div>
      )}
      {templates.data && !templates.data.configured && <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm"><Icon name="TriangleAlert" className="size-4 text-amber-600" />O canal de email não está configurado: os emails ficam registados mas não saem.</div>}

      <Tabs value={tab} onValueChange={(v) => void setTab(v)}>
        <TabsList>
          <TabsTrigger value="registo">Registo de envios</TabsTrigger>
          <TabsTrigger value="modelos">Modelos</TabsTrigger>
        </TabsList>

        <TabsContent value="registo" className="space-y-4 pt-4">
          <FilterToolbar
            search={{ value: search, onChange: (v) => void setSearch(v), placeholder: "Destinatário (mín. 3 letras)…" }}
            filters={[
              { key: "status", label: "Estado", value: status, onChange: (v) => void setStatus(v), options: Object.entries(STATUS).map(([value, x]) => ({ value, label: x.label })) },
              { key: "template", label: "Modelo", value: template, onChange: (v) => void setTemplate(v), options: (templates.data?.data ?? []).map((t) => ({ value: t.code, label: t.name })) },
            ]}
            onClear={() => { void setStatus(""); void setTemplate(""); void setSearch(""); }}
          />
          {log.isLoading ? <ListSkeleton cols={6} rows={4} /> : (
            <GenericTable<EmailLogRow> data={logPage.rows} columns={logColumns} page={logPage.page} total={logPage.total} totalPages={logPage.totalPages} setPage={logPage.setPage} goToNextPage={logPage.goToNextPage} goToPreviousPage={logPage.goToPreviousPage} emptyTitle="Sem envios" emptyDescription="Nenhum email corresponde aos filtros." emptyIcon="Mail" />
          )}
        </TabsContent>

        <TabsContent value="modelos" className="pt-4">
          {templates.isLoading ? <ListSkeleton cols={5} rows={4} /> : (
            <GenericTable<EmailTemplate & { id: string }> data={tplPage.rows.map((t) => ({ ...t, id: t.code }))} columns={tplColumns} page={tplPage.page} total={tplPage.total} totalPages={tplPage.totalPages} setPage={tplPage.setPage} goToNextPage={tplPage.goToNextPage} goToPreviousPage={tplPage.goToPreviousPage} emptyTitle="Sem modelos" emptyDescription="O catálogo não tem modelos." emptyIcon="Mail" />
          )}
        </TabsContent>
      </Tabs>

      <PreviewModal />
      <TestModal />
    </div>
  );
}
