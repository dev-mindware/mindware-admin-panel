"use client";

import { useState } from "react";
import { Badge, Button, Input, Panel, SelectField } from "@workspace/ui";
import { AdminTable } from "@/components/admin/shared/admin-table";
import { useSchools } from "@/hooks/directory/use-directory";
import { useAudit } from "@/hooks/ops/use-ops";
import { securityService, type AuditFilters } from "@/services/ops-service";
import { getApiErrorMessage } from "@/utils/api-error";
import { dateTime } from "@/utils/format";
import { ErrorMessage } from "@/utils/messages";
import type { AuditRow, IntegrityResult } from "@/types/directory";

const ALL = "todas";
const ACTIONS = [["criacao", "Criação"], ["actualizacao", "Actualização"], ["fecho", "Fecho"], ["reabertura", "Reabertura"], ["anulacao", "Anulação"]] as const;
const MODULES = ["academico", "avaliacao", "pessoas", "financeiro", "documentos", "organizacao", "comunicacao", "relatorios"] as const;
const MAX_ROUNDS = 40; // 40 × 5000 registos: chega para escolas grandes sem prender o navegador

/** Auditoria global (janela até 31 dias) e verificação da cadeia de hashes de uma escola. */
export function SecurityAuditTab() {
  const schools = useSchools({});
  const schoolRows = schools.all;
  const [draft, setDraft] = useState({ school: ALL, actor: "", action: ALL, module: ALL, from: "", to: "", text: "" });
  const [applied, setApplied] = useState<AuditFilters>({});
  const set = (k: keyof typeof draft) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const apply = () =>
    setApplied({
      ...(draft.school !== ALL ? { schoolId: draft.school } : {}),
      ...(draft.actor.trim().length >= 3 ? { actorEmail: draft.actor.trim() } : {}),
      ...(draft.action !== ALL ? { action: draft.action } : {}),
      ...(draft.module !== ALL ? { module: draft.module } : {}),
      ...(draft.from ? { from: draft.from } : {}),
      ...(draft.to ? { to: draft.to } : {}),
      ...(draft.text.trim().length >= 3 ? { text: draft.text.trim() } : {}),
    });
  const audit = useAudit(applied);
  const schoolName = (id: string | null) => (id ? (schoolRows.find((s) => s.id === id)?.name ?? "—") : "Plataforma");

  const [verifySchool, setVerifySchool] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<(IntegrityResult & { total: number; partial: boolean }) | null>(null);
  const verify = async () => {
    if (!verifySchool) return;
    setRunning(true);
    setResult(null);
    try {
      let total = 0;
      let after: string | undefined;
      let last: IntegrityResult | null = null;
      for (let i = 0; i < MAX_ROUNDS; i++) {
        last = await securityService.integrity(verifySchool, after);
        total += last.checked;
        if (!last.ok || !last.next_after_seq) break;
        after = last.next_after_seq;
      }
      if (last) setResult({ ...last, total, partial: last.ok && last.next_after_seq !== null });
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível verificar a integridade."));
    } finally {
      setRunning(false);
    }
  };

  const columns = [
    { key: "when", header: "Quando", render: (_: unknown, e: AuditRow) => <span className="text-xs">{dateTime(e.occurred_at)}</span> },
    { key: "actor", header: "Autor", render: (_: unknown, e: AuditRow) => <span className="text-sm font-medium">{e.actor?.full_name ?? "Sistema"}</span> },
    { key: "what", header: "O quê", render: (_: unknown, e: AuditRow) => <div><p className="text-sm">{e.action} · {e.entity_type}</p>{e.reason && <p className="max-w-md truncate text-xs text-muted-foreground">{e.reason}</p>}</div> },
    { key: "school", header: "Escola", render: (_: unknown, e: AuditRow) => <span className="text-xs">{schoolName(e.organization_id)}</span> },
    { key: "module", header: "Módulo", render: (_: unknown, e: AuditRow) => <Badge variant="secondary" className="text-[10px]">{e.module}</Badge> },
    { key: "ip", header: "IP", render: (_: unknown, e: AuditRow) => <span className="font-mono text-xs text-muted-foreground">{e.ip ?? "—"}</span> },
  ];

  return (
    <div className="space-y-4">
      <Panel title="Verificar integridade da auditoria" description="Recalcula a cadeia de hashes de todos os registos da escola: se algum foi alterado ou apagado, a cadeia quebra e o primeiro registo afectado é indicado." icon="ShieldCheck">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-72"><SelectField label="Escola" value={verifySchool} onValueChange={setVerifySchool} options={schoolRows.map((s) => ({ value: s.id, label: s.name }))} /></div>
          <Button size="sm" disabled={!verifySchool} loading={running} onClick={() => void verify()}>Verificar</Button>
        </div>
        {result && (
          <div className={`mt-3 rounded-md border p-3 text-sm ${result.ok ? "border-green-500/40" : "border-destructive/60"}`}>
            {result.ok ? (
              <p><Badge variant="success" className="mr-2">Íntegra</Badge>{result.total} registo(s) verificado(s), sem alterações detectadas.{result.partial ? " A verificação parou ao atingir o limite; volte a correr para continuar." : ""}</p>
            ) : (
              <p><Badge variant="destructive" className="mr-2">Quebrada</Badge>Primeiro registo afectado: <span className="font-mono text-xs">{result.first_break?.id}</span> (sequência {result.first_break?.seq}; {result.first_break?.reason === "prev_hash_mismatch" ? "ligação ao registo anterior alterada" : "conteúdo alterado"}).</p>
            )}
          </div>
        )}
      </Panel>

      <Panel title="Auditoria global" description="Sem datas, mostram-se os últimos 7 dias; a janela máxima é de 31 dias. A pesquisa fica registada." icon="ScrollText">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <SelectField label="Escola" value={draft.school} onValueChange={set("school")} options={[{ value: ALL, label: "Todas as escolas" }, ...schoolRows.map((s) => ({ value: s.id, label: s.name }))]} />
            <SelectField label="Acção" value={draft.action} onValueChange={set("action")} options={[{ value: ALL, label: "Todas as acções" }, ...ACTIONS.map(([value, label]) => ({ value, label }))]} />
            <SelectField label="Módulo" value={draft.module} onValueChange={set("module")} options={[{ value: ALL, label: "Todos os módulos" }, ...MODULES.map((m) => ({ value: m, label: m }))]} />
            <Input label="Autor (email, mín. 3 letras)" value={draft.actor} onChange={(e) => set("actor")(e.target.value)} />
            <Input label="Texto do motivo (mín. 3 letras)" value={draft.text} onChange={(e) => set("text")(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" label="Desde" value={draft.from} onChange={(e) => set("from")(e.target.value)} />
              <Input type="date" label="Até" value={draft.to} onChange={(e) => set("to")(e.target.value)} />
            </div>
          </div>
          <Button size="sm" onClick={apply}>Pesquisar</Button>
          <AdminTable list={audit} columns={columns} emptyTitle="Nenhum registo" emptyDescription="Nenhum registo para estes filtros." emptyIcon="ScrollText" />
        </div>
      </Panel>
    </div>
  );
}
