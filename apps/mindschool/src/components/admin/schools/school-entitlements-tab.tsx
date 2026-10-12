"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Button, Icon, Input, Panel, Progress, ReasonModal, SelectField, ToneBadge } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { QUOTA_LABEL } from "@/constants/labels";
import { useCreateOverride, useEntitlements } from "@/hooks/directory/use-directory";
import { getApiErrorMessage } from "@/utils/api-error";
import { day } from "@/utils/format";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";

const MODAL = "override-form";
const QUOTA_TONE = { OK: "success", ALERT: "warning", LIMIT_REACHED: "danger" } as const;

interface Draft {
  kind: "feature" | "quota";
  key: string;
  value: string;
  endsAt: string;
}

function OverrideFields({ keys, draftRef }: { keys: { feature: string[]; quota: string[] }; draftRef: React.MutableRefObject<Draft> }) {
  const [d, setD] = useState<Draft>({ kind: "feature", key: "", value: "true", endsAt: "" });
  useEffect(() => {
    draftRef.current = d;
  });
  const set = (p: Partial<Draft>) => setD({ ...d, ...p });
  const list = d.kind === "feature" ? keys.feature : keys.quota;
  const [now] = useState(() => Date.now());
  const tomorrow = new Date(now + 86_400_000).toISOString().slice(0, 10);
  const max = new Date(now + 90 * 86_400_000).toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Tipo" value={d.kind} options={[{ value: "feature", label: "Funcionalidade" }, { value: "quota", label: "Quota" }]} onValueChange={(v) => set({ kind: v as Draft["kind"], key: "", value: v === "feature" ? "true" : "" })} />
        <SelectField label={d.kind === "feature" ? "Funcionalidade" : "Quota"} value={d.key} options={list.map((k) => ({ value: k, label: d.kind === "quota" ? (QUOTA_LABEL[k] ?? k) : k }))} onValueChange={(key) => set({ key })} />
        {d.kind === "feature" ? (
          <SelectField label="Valor" value={d.value} options={[{ value: "true", label: "Conceder" }, { value: "false", label: "Retirar" }]} onValueChange={(value) => set({ value })} />
        ) : (
          <Input label="Novo limite (vazio = ilimitado)" inputMode="numeric" value={d.value} onChange={(e) => set({ value: e.target.value.replace(/\D/g, "") })} />
        )}
        <Input type="date" label="Termina em * (máx. 90 dias)" min={tomorrow} max={max} value={d.endsAt} onChange={(e) => set({ endsAt: e.target.value })} />
      </div>
      <p className="text-xs text-muted-foreground">As excepções são temporárias e ficam registadas. Para mudar o plano de forma duradoura, use uma ordem de subscrição.</p>
    </div>
  );
}

/** Quotas (uso vs limite), funcionalidades e excepções de direitos de uma escola. */
export function SchoolEntitlementsTab({ schoolId }: { schoolId: string }) {
  const { entitlements: ent, overrides: ovr } = useEntitlements(schoolId);
  const create = useCreateOverride(schoolId);
  const { openModal } = useModalStore();
  const draftRef = useRef<Draft>({ kind: "feature", key: "", value: "true", endsAt: "" });

  if (ent.isLoading) return <p className="text-sm text-muted-foreground">A carregar…</p>;
  const features = ent.data?.features ?? [];
  const quotas = ent.data?.quotas ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Quotas do plano" icon="Gauge">
        <div className="space-y-3">
          {quotas.map((q) => {
            const pct = q.limit ? Math.min(100, Math.round((q.used / q.limit) * 100)) : 0;
            return (
              <div key={q.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{QUOTA_LABEL[q.key] ?? q.key}</span>
                  <span className="flex items-center gap-2 text-muted-foreground">{q.used} / {q.limit ?? "∞"}<ToneBadge tone={QUOTA_TONE[q.state]} label={q.state === "OK" ? "Ok" : q.state === "ALERT" ? "Alerta" : "No limite"} className="text-[10px]" /></span>
                </div>
                {q.limit ? <Progress value={pct} className="h-1.5" /> : null}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Funcionalidades" icon="ToggleRight">
        <div className="grid max-h-72 gap-1.5 overflow-y-auto sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-xs" title={f.reason}>
              <span className="truncate font-mono">{f.key}</span>
              {f.entitled ? <Badge variant="success" className="text-[10px]">{f.source ?? "sim"}</Badge> : <Badge variant="secondary" className="text-[10px]">não</Badge>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Excepções"
        description="Direitos concedidos ou retirados por tempo limitado"
        icon="Sparkles"
        className="lg:col-span-2"
        action={<Button size="sm" className="gap-2" onClick={() => openModal(MODAL)}><Icon name="Plus" className="size-4" />Nova excepção</Button>}
      >
        {(ovr.data ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Sem excepções.</p>
        ) : (
          <ul className="divide-y">
            {(ovr.data ?? []).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <p className="font-mono text-xs font-medium">{o.key} = {String(o.value)}</p>
                  <p className="text-xs text-muted-foreground">{o.reason}{o.ticket ? ` · ${o.ticket}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">até {day(o.ends_at)}</span>
                  <ToneBadge tone={o.active ? "success" : "neutral"} label={o.active ? "Activa" : "Terminada"} className="text-[10px]" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <ReasonModal
        id={MODAL}
        icon="KeyRound"
        title="Nova excepção de direitos"
        description="Concede ou retira uma funcionalidade ou quota a esta escola, por tempo limitado."
        withTicket
        confirmLabel="Criar excepção"
        onConfirm={async ({ reason, ticket }) => {
          const d = draftRef.current;
          try {
            if (!d.key || !d.endsAt) throw new Error("Escolha o direito e a data de fim.");
            await create.mutateAsync({
              key: `${d.kind}:${d.key}`,
              value: d.kind === "feature" ? d.value === "true" : d.value.trim() === "" ? null : Number(d.value),
              endsAt: new Date(`${d.endsAt}T23:59:59`).toISOString(),
              reason,
              ...(ticket ? { ticket } : {}),
            });
            SuccessMessage("Excepção criada.");
          } catch (e) {
            ErrorMessage(getApiErrorMessage(e, "Não foi possível criar a excepção."));
            throw e;
          }
        }}
      >
        {() => <OverrideFields keys={{ feature: features.map((f) => f.key), quota: quotas.map((q) => q.key) }} draftRef={draftRef} />}
      </ReasonModal>
    </div>
  );
}
