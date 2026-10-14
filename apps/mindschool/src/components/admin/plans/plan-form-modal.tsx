"use client";

import { useEffect, useRef, useState } from "react";
import { Checkbox, FormSection, Icon, Input, InputCurrency, ReasonModal, SelectField, Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui";
import { useCatalogActions, useCatalogMeta } from "@/hooks/commerce/use-catalog";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { AdminPlan } from "@/types/api";

export const PLAN_FORM_MODAL = "plan-form";

const POLICIES = [
  { value: "HARD_BLOCK", label: "Bloquear ao atingir" },
  { value: "SOFT_LIMIT", label: "Avisar, sem bloquear" },
  { value: "GRACE", label: "Tolerância" },
  { value: "READ_ONLY", label: "Passar a só leitura" },
  { value: "OVERAGE", label: "Permitir excedente" },
];

interface Draft {
  code: string;
  name: string;
  price: string;
  rank: string;
  features: string[];
  limits: Record<string, { unlimited: boolean; value: string; policy: string }>;
}

function toDraft(plan: AdminPlan | undefined, quotaKeys: string[]): Draft {
  return {
    code: plan?.code ?? "",
    name: plan?.name ?? "",
    price: plan?.monthly_price ?? "",
    rank: plan ? String(plan.rank) : "",
    features: plan?.features ?? [],
    limits: Object.fromEntries(
      quotaKeys.map((k) => {
        const l = plan?.limits?.[k];
        return [k, { unlimited: l ? l.limit === null : false, value: l?.limit != null ? String(l.limit) : "", policy: l?.policy ?? "HARD_BLOCK" }];
      }),
    ),
  };
}

function PlanFields({ plan, draftRef }: { plan: AdminPlan | undefined; draftRef: React.MutableRefObject<Draft | null> }) {
  const meta = useCatalogMeta();
  const features = meta.data?.features ?? [];
  const quotas = meta.data?.quotas ?? [];
  const [draft, setDraft] = useState<Draft>(() => toDraft(plan, quotas.map((q) => q.key)));
  // as quotas só chegam depois do catálogo carregar: completa as que faltam sem perder o que já foi escrito
  const merged: Draft = { ...draft, limits: { ...toDraft(plan, quotas.map((q) => q.key)).limits, ...draft.limits } };
  useEffect(() => {
    draftRef.current = merged;
  });
  const set = (patch: Partial<Draft>) => setDraft({ ...merged, ...patch });
  const editing = Boolean(plan);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-2">
          <TabsTrigger value="geral" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
            <Icon name="Package" className="size-4 shrink-0" />
            <span>1. Geral & Preço</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
            <Icon name="ListChecks" className="size-4 shrink-0" />
            <span>2. Funcionalidades ({merged.features.length})</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
            <Icon name="Gauge" className="size-4 shrink-0" />
            <span>3. Quotas & Limites</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-2 focus-visible:outline-none">
          <FormSection icon="Package" title="Identificação e preço" description="Como o plano aparece no catálogo e quanto custa por mês.">
            <Input label="Código *" disabled={editing} placeholder="Ex.: premium" hint={editing ? "O código não se altera depois de criado." : "Identificador técnico, em minúsculas. Não se muda depois."} className="font-mono lowercase" value={merged.code} onChange={(e) => set({ code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })} />
            <Input label="Nome *" placeholder="Ex.: Premium" hint="O nome que a escola vê." value={merged.name} onChange={(e) => set({ name: e.target.value })} />
            <InputCurrency label="Preço mensal em Kz *" placeholder="Ex.: 29.900,00" suffix=" Kz" hint="Cobrado por mês, por escola." value={merged.price} onValueChange={(n) => set({ price: n ? String(n) : "" })} />
            <Input label="Posição na hierarquia *" inputMode="numeric" placeholder="Ex.: 2" hint="1 = plano mais simples. Define o que é upgrade e downgrade." value={merged.rank} onChange={(e) => set({ rank: e.target.value.replace(/\D/g, "") })} />
          </FormSection>
        </TabsContent>

        <TabsContent value="features" className="mt-2 focus-visible:outline-none">
          <FormSection icon="ListChecks" title="Funcionalidades incluídas" description="Marque o que este plano dá à escola." columns={1}>
            <div className="grid max-h-56 gap-2 overflow-y-auto rounded-lg border bg-background p-3 sm:grid-cols-2">
              {features.length === 0 && <p className="text-xs text-muted-foreground">A carregar funcionalidades…</p>}
              {features.map((f) => (
                <label key={f.key} className="flex cursor-pointer items-start gap-2 text-xs hover:bg-muted/30 p-1 rounded" title={f.message}>
                  <Checkbox
                    checked={merged.features.includes(f.key)}
                    onCheckedChange={(c) => set({ features: c ? [...merged.features, f.key] : merged.features.filter((x) => x !== f.key) })}
                  />
                  <span className="font-mono">{f.key}</span>
                </label>
              ))}
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="limits" className="mt-2 focus-visible:outline-none">
          <FormSection icon="Gauge" title="Limites de utilização" description="Até quanto a escola pode usar e o que acontece ao atingir o limite." columns={1}>
            <div className="space-y-3 max-h-60 overflow-y-auto rounded-lg border bg-background p-3">
              {quotas.map((q) => {
                const l = merged.limits[q.key] ?? { unlimited: false, value: "", policy: "HARD_BLOCK" };
                const patch = (p: Partial<typeof l>) => set({ limits: { ...merged.limits, [q.key]: { ...l, ...p } } });
                return (
                  <div key={q.key} className="grid items-end gap-2 border-b pb-3 last:border-0 last:pb-0 sm:grid-cols-[1fr_120px_auto_190px]">
                    <p className="text-xs font-medium capitalize sm:pb-2">{q.label}</p>
                    <Input aria-label={`Limite de ${q.label}`} inputMode="numeric" disabled={l.unlimited} placeholder={l.unlimited ? "∞" : "Ex.: 500"} value={l.unlimited ? "" : l.value} onChange={(e) => patch({ value: e.target.value.replace(/\D/g, "") })} />
                    <label className="flex items-center gap-1.5 pb-2 text-xs">
                      <Checkbox checked={l.unlimited} onCheckedChange={(c) => patch({ unlimited: Boolean(c) })} />
                      Ilimitado
                    </label>
                    <SelectField label="" value={l.policy} options={POLICIES} onValueChange={(v) => patch({ policy: v })} />
                  </div>
                );
              })}
            </div>
          </FormSection>
        </TabsContent>
      </Tabs>
      {editing && <p className="text-xs text-muted-foreground">Alterar preço ou limites afecta só as ordens novas: as já feitas guardam o preço do momento.</p>}
    </div>
  );
}

/** Criar ou editar um plano (preço, hierarquia, funcionalidades e limites). Abre com `openModal("plan-form", plan?)`. */
export function PlanFormModal() {
  const draftRef = useRef<Draft | null>(null);
  const { createPlan, updatePlan } = useCatalogActions();

  return (
    <ReasonModal<AdminPlan | undefined>
      id={PLAN_FORM_MODAL}
      title="Plano"
      icon="Package"
      confirmIcon="Save"
      size="xl"
      description={(p) => (p ? `Editar «${p.name}» (versão do catálogo ${p.catalog_version}).` : "Criar um plano novo no catálogo.")}
      confirmLabel="Guardar"
      onConfirm={async ({ reason }, plan) => {
        const d = draftRef.current;
        try {
          if (!d || !d.name.trim() || !d.price || !d.rank || (!plan && !d.code.trim())) throw new Error("Preencha o código, o nome, o preço e a posição.");
          const limits = Object.fromEntries(Object.entries(d.limits).map(([k, v]) => [k, { limit: v.unlimited ? null : Number(v.value || 0), policy: v.policy }]));
          const base = { name: d.name.trim(), monthly_price: Number(d.price).toFixed(2), rank: Number(d.rank), features: d.features, limits };
          if (plan) await updatePlan.mutateAsync({ id: plan.id, body: { ...base, reason } });
          else await createPlan.mutateAsync({ ...base, code: d.code.trim(), reason });
          SuccessMessage(plan ? "Plano actualizado." : "Plano criado.");
        } catch (e) {
          ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar o plano."));
          throw e;
        }
      }}
    >
      {(plan) => <PlanFields key={plan?.id ?? "novo"} plan={plan} draftRef={draftRef} />}
    </ReasonModal>
  );
}
