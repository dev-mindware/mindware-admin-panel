"use client";

import { useEffect, useRef, useState } from "react";
import { Checkbox, FormSection, Input, InputCurrency, ReasonModal } from "@workspace/ui";
import { useAddons, useCatalogActions, useCatalogMeta } from "@/hooks/commerce/use-catalog";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { AdminAddon } from "@/types/api";

export const ADDON_FORM_MODAL = "addon-form";

interface Draft {
  code: string;
  name: string;
  price: string;
  minRank: string;
  grants: string[];
  limitGrants: Record<string, string>;
  conflicts: string[];
  requires: string[];
}

const toDraft = (a: AdminAddon | undefined): Draft => ({
  code: a?.code ?? "",
  name: a?.name ?? "",
  price: a?.monthly_price ?? "",
  minRank: a?.min_plan_rank != null ? String(a.min_plan_rank) : "",
  grants: a?.grants ?? [],
  limitGrants: Object.fromEntries(Object.entries(a?.limit_grants ?? {}).map(([k, v]) => [k, String(v)])),
  conflicts: a?.conflicts_with ?? [],
  requires: a?.requires ?? [],
});

function Pick({ title, options, value, onChange }: { title: string; options: Array<{ value: string; label: string }>; value: string[]; onChange: (v: string[]) => void }) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{title}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-lg border bg-background p-3">
        {options.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2 text-xs">
            <Checkbox checked={value.includes(o.value)} onCheckedChange={(c) => onChange(c ? [...value, o.value] : value.filter((x) => x !== o.value))} />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function AddonFields({ addon, draftRef }: { addon: AdminAddon | undefined; draftRef: React.MutableRefObject<Draft | null> }) {
  const meta = useCatalogMeta();
  const addons = useAddons();
  const [draft, setDraft] = useState<Draft>(() => toDraft(addon));
  useEffect(() => {
    draftRef.current = draft;
  });
  const set = (p: Partial<Draft>) => setDraft({ ...draft, ...p });
  const others = (addons.data ?? []).filter((a) => a.code !== addon?.code).map((a) => ({ value: a.code, label: a.name }));

  return (
    <div className="space-y-4">
      <FormSection icon="Puzzle" title="Identificação e preço" description="Um extra que a escola contrata por cima do plano.">
        <Input label="Código *" disabled={Boolean(addon)} placeholder="Ex.: alunos_extra" hint={addon ? "O código não se altera depois de criado." : "Identificador técnico, em minúsculas. Não se muda depois."} className="font-mono lowercase" value={draft.code} onChange={(e) => set({ code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })} />
        <Input label="Nome *" placeholder="Ex.: Pacote de 100 alunos extra" hint="O nome que a escola vê." value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        <InputCurrency label="Preço mensal em Kz *" placeholder="Ex.: 4.500,00" suffix=" Kz" hint="Somado à mensalidade do plano." value={draft.price} onValueChange={(n) => set({ price: n ? String(n) : "" })} />
        <Input label="Plano mínimo (posição)" inputMode="numeric" placeholder="Qualquer plano" hint="Só planos com esta posição ou superior o podem contratar." value={draft.minRank} onChange={(e) => set({ minRank: e.target.value.replace(/\D/g, "") })} />
      </FormSection>

      <FormSection icon="Sparkles" title="O que concede" description="Funcionalidades abertas e quotas somadas ao limite do plano." columns={1}>
        <Pick title="Funcionalidades que concede" options={(meta.data?.features ?? []).map((f) => ({ value: f.key, label: f.key }))} value={draft.grants} onChange={(grants) => set({ grants })} />
        <div>
          <p className="mb-1.5 text-sm font-medium">Quota que acrescenta</p>
          <div className="grid gap-3 rounded-lg border bg-background p-3 sm:grid-cols-2">
            {(meta.data?.quotas ?? []).map((q) => (
              <Input key={q.key} label={`+ ${q.label}`} inputMode="numeric" placeholder="0" value={draft.limitGrants[q.key] ?? ""} onChange={(e) => set({ limitGrants: { ...draft.limitGrants, [q.key]: e.target.value.replace(/\D/g, "") } })} />
            ))}
          </div>
        </div>
      </FormSection>

      {(others.length > 0) && (
        <FormSection icon="Link2" title="Compatibilidade" description="Relação com os outros add-ons." columns={1}>
          <Pick title="Incompatível com" options={others} value={draft.conflicts} onChange={(conflicts) => set({ conflicts })} />
          <Pick title="Requer" options={others} value={draft.requires} onChange={(requires) => set({ requires })} />
        </FormSection>
      )}
    </div>
  );
}

/** Criar ou editar um add-on. Abre com `openModal("addon-form", addon?)`. */
export function AddonFormModal() {
  const draftRef = useRef<Draft | null>(null);
  const { createAddon, updateAddon } = useCatalogActions();

  return (
    <ReasonModal<AdminAddon | undefined>
      id={ADDON_FORM_MODAL}
      title="Add-on"
      icon="Puzzle"
      confirmIcon="Save"
      size="lg"
      description={(a) => (a ? `Editar «${a.name}» (versão ${a.catalog_version}).` : "Criar um add-on novo no catálogo.")}
      confirmLabel="Guardar"
      onConfirm={async ({ reason }, addon) => {
        const d = draftRef.current;
        try {
          if (!d || !d.name.trim() || !d.price || (!addon && !d.code.trim())) throw new Error("Preencha o código, o nome e o preço.");
          const limit_grants = Object.fromEntries(Object.entries(d.limitGrants).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, Number(v)]));
          const base = {
            name: d.name.trim(), monthly_price: Number(d.price).toFixed(2), grants: d.grants, limit_grants,
            min_plan_rank: d.minRank ? Number(d.minRank) : null, conflicts_with: d.conflicts, requires: d.requires,
          };
          if (addon) await updateAddon.mutateAsync({ id: addon.id, body: { ...base, reason } });
          else await createAddon.mutateAsync({ ...base, code: d.code.trim(), reason });
          SuccessMessage(addon ? "Add-on actualizado." : "Add-on criado.");
        } catch (e) {
          ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar o add-on."));
          throw e;
        }
      }}
    >
      {(addon) => <AddonFields key={addon?.id ?? "novo"} addon={addon} draftRef={draftRef} />}
    </ReasonModal>
  );
}
