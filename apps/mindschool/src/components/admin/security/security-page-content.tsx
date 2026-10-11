"use client";

import { useState } from "react";
import { Badge, Button, FilterToolbar, Icon, MetricGrid, Panel, SelectField, StatusBadge, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@workspace/ui";
import { useQueryState } from "nuqs";
import { ALERT_TYPE_LABEL, OPERATION_LABEL } from "@/constants/labels";
import { SEVERITY } from "@/constants/statuses";
import { useAcknowledge, useAlerts, useSecurityOverview } from "@/hooks/ops/use-ops";
import { getApiErrorMessage } from "@/utils/api-error";
import { dateTime } from "@/utils/format";
import { ErrorMessage } from "@/utils/messages";
import { SecurityAuditTab } from "./security-audit-tab";

function OverviewTab({ onGoAlerts }: { onGoAlerts: () => void }) {
  const [days, setDays] = useState("7");
  const q = useSecurityOverview(Number(days));
  const o = q.data;

  return (
    <div className="space-y-4">
      <div className="w-56"><SelectField label="Período" value={days} onValueChange={setDays} options={[{ value: "1", label: "Último dia" }, { value: "7", label: "Últimos 7 dias" }, { value: "30", label: "Últimos 30 dias" }, { value: "90", label: "Últimos 90 dias" }]} /></div>

      <MetricGrid
        isLoading={q.isLoading}
        isError={q.isError}
        onRetry={() => void q.refetch()}
        items={
          o
            ? [
                { title: o.alerts.unacknowledged, subtitle: "Alertas por reconhecer", description: `${o.alerts.critical_unacknowledged} crítico(s)`, icon: "ShieldAlert", variant: o.alerts.unacknowledged > 0 ? "action" : "default", colors: "destructive", onClick: onGoAlerts },
                { title: o.accounts.titulars_without_mfa, subtitle: "Titulares sem 2FA", description: "Papéis que o exigem", icon: "ShieldOff", variant: o.accounts.titulars_without_mfa > 0 ? "action" : "default", colors: "destructive" },
                { title: o.accounts.blocked, subtitle: "Contas bloqueadas", description: `${o.accounts.temporarily_locked} em bloqueio temporário`, icon: "Ban" },
                { title: o.accounts.with_failed_attempts, subtitle: "Com tentativas falhadas", description: "Falhas em curso", icon: "KeyRound" },
                { title: o.impersonations.started, subtitle: "Personificações", description: `${o.impersonations.with_write} com escrita · ${o.impersonations.active_now} activa(s)`, icon: "UserCog" },
              ]
            : []
        }
        skeletons={5}
      />

      {o && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Alertas no período" icon="Siren">
            {o.alerts.by_type.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">Nenhum alerta no período.</p> : (
              <ul className="space-y-1.5">
                {o.alerts.by_type.map((a) => (
                  <li key={`${a.type}-${a.severity}`} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2"><StatusBadge status={a.severity} map={SEVERITY} className="text-[10px]" />{ALERT_TYPE_LABEL[a.type] ?? a.type}</span>
                    <span className="font-semibold tabular-nums">{a.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Operações sensíveis" description="Acções de suporte e administração no período" icon="ClipboardList">
            {o.sensitive_operations.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma operação sensível no período.</p> : (
              <ul className="space-y-1.5">
                {o.sensitive_operations.map((x) => (
                  <li key={x.operation} className="flex items-center justify-between gap-3 text-sm"><span>{OPERATION_LABEL[x.operation] ?? x.operation}</span><span className="font-semibold tabular-nums">{x.count}</span></li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Contas a precisar de atenção" icon="UserX" className="lg:col-span-2">
            {o.accounts.attention.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma conta com tentativas falhadas em curso.</p> : (
              <ul className="divide-y">
                {o.accounts.attention.map((u) => (
                  <li key={u.user_id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <div><p className="font-medium">{u.full_name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                    <div className="flex items-center gap-2">
                      {u.status === "bloqueado" && <Badge variant="destructive" className="text-[10px]">Bloqueada</Badge>}
                      {u.locked_until && <Badge variant="pending" className="text-[10px]">Bloqueio temporário até {dateTime(u.locked_until)}</Badge>}
                      <span className="text-xs text-muted-foreground">{u.failed_attempts} tentativa(s) falhada(s)</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="pt-2 text-[11px] text-muted-foreground">As tentativas falhadas não ficam guardadas como histórico: mostram-se as contas com falhas em curso. Para desbloquear, use Utilizadores.</p>
          </Panel>
        </div>
      )}
    </div>
  );
}

function AlertsTab() {
  const [severity, setSeverity] = useState("");
  const [onlyOpen, setOnlyOpen] = useState("abertos");
  const q = useAlerts({ ...(severity ? { severity } : {}), onlyOpen: onlyOpen === "abertos" });
  const ack = useAcknowledge();
  const rows = q.data ?? [];

  return (
    <div className="space-y-3">
      <FilterToolbar
        filters={[
          { key: "sev", label: "Gravidade", value: severity, onChange: setSeverity, options: Object.entries(SEVERITY).map(([value, v]) => ({ value, label: v.label })) },
          { key: "state", label: "Estado", value: onlyOpen === "abertos" ? "" : onlyOpen, placeholder: "Por reconhecer", onChange: (v) => setOnlyOpen(v || "abertos"), options: [{ value: "todos", label: "Todos" }] },
        ]}
      />
      {q.isLoading && <p className="text-sm text-muted-foreground">A carregar…</p>}
      {!q.isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card py-12 text-center">
          <Icon name="ShieldCheck" className="size-10 text-green-600" />
          <p className="font-medium">Sem alertas</p>
          <p className="text-sm text-muted-foreground">Nenhum alerta corresponde aos filtros.</p>
        </div>
      )}
      {rows.map((a) => (
        <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-card p-3">
          <div className="space-y-0.5">
            <p className="flex items-center gap-2 text-sm font-medium"><StatusBadge status={a.severity} map={SEVERITY} className="text-[10px]" />{ALERT_TYPE_LABEL[a.type] ?? a.type}</p>
            <p className="text-xs text-muted-foreground">
              {dateTime(a.created_at)}
              {a.school ? ` · ${a.school.name ?? "Escola"}` : ""}
              {a.user ? ` · ${a.user.full_name ?? ""} ${a.user.email ? `(${a.user.email})` : ""}` : ""}
              {a.acknowledged_at ? ` · reconhecido ${dateTime(a.acknowledged_at)}` : ""}
            </p>
            {a.details != null && <p className="max-w-2xl truncate font-mono text-[11px] text-muted-foreground" title={JSON.stringify(a.details)}>{JSON.stringify(a.details)}</p>}
          </div>
          {!a.acknowledged_at && (
            <Button size="sm" variant="outline" disabled={ack.isPending} onClick={() => ack.mutate(a.id, { onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível reconhecer o alerta.")) })}>
              Reconhecer
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

/** Centro de segurança: relatório, alertas com reconhecimento, auditoria global e verificação de integridade. */
export function SecurityPageContent() {
  const [tab, setTab] = useQueryState("tab", { defaultValue: "resumo" });
  return (
    <div className="flex flex-col gap-6">
      <TitleList title="Segurança" suTitle="O que precisa de atenção na plataforma: alertas, contas, operações sensíveis e a integridade da auditoria." />
      <Tabs value={tab} onValueChange={(v) => void setTab(v)}>
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria e integridade</TabsTrigger>
        </TabsList>
        <TabsContent value="resumo" className="pt-4"><OverviewTab onGoAlerts={() => void setTab("alertas")} /></TabsContent>
        <TabsContent value="alertas" className="pt-4"><AlertsTab /></TabsContent>
        <TabsContent value="auditoria" className="pt-4"><SecurityAuditTab /></TabsContent>
      </Tabs>
    </div>
  );
}
