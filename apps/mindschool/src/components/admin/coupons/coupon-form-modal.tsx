"use client";

import { useEffect, useRef, useState } from "react";
import { FormSection, Input, InputCurrency, ReasonModal, SelectField, Switch } from "@workspace/ui";
import { useCouponActions, usePlans } from "@/hooks/commerce/use-catalog";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { AdminCoupon } from "@/types/api";

export const COUPON_FORM_MODAL = "coupon-form";

interface Draft {
  code: string;
  description: string;
  type: "percentage" | "fixed_amount";
  value: string;
  perSchool: string;
  total: string;
  minMonths: string;
  plan: string;
  starts: string;
  ends: string;
  active: boolean;
}

/** Datas de calendário na hora local do administrador: o início vale desde as 00:00 e o fim até às 23:59. */
const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60_000).toISOString().slice(0, 10) : "");
const toIso = (date: string, end = false) => (date ? new Date(`${date}T${end ? "23:59:59" : "00:00:00"}`).toISOString() : null);

const toDraft = (c: AdminCoupon | undefined): Draft => ({
  code: c?.code ?? "",
  description: c?.description ?? "",
  type: c?.discount_type ?? "percentage",
  value: c ? String(Number(c.discount_value)) : "",
  perSchool: String(c?.max_uses_per_school ?? 1),
  total: c?.max_total_uses != null ? String(c.max_total_uses) : "",
  minMonths: c?.min_period_months != null ? String(c.min_period_months) : "",
  plan: c?.applicable_plan?.code ?? "",
  starts: toLocal(c?.starts_at ?? null),
  ends: toLocal(c?.expires_at ?? null),
  active: c?.is_active ?? true,
});

function CouponFields({ coupon, draftRef }: { coupon: AdminCoupon | undefined; draftRef: React.MutableRefObject<Draft | null> }) {
  const plans = usePlans();
  const [draft, setDraft] = useState<Draft>(() => toDraft(coupon));
  useEffect(() => {
    draftRef.current = draft;
  });
  const set = (p: Partial<Draft>) => setDraft({ ...draft, ...p });
  const digits = (v: string) => v.replace(/\D/g, "");

  return (
    <div className="space-y-4">
      <FormSection icon="Ticket" title="Código e desconto" description="O que a escola escreve na cotação e quanto poupa.">
        <Input label="Código *" disabled={Boolean(coupon)} placeholder="Ex.: VOLTA26" hint={coupon ? "O código não se altera depois de criado." : "Letras, dígitos, - e _. Mínimo 3 caracteres."} className="font-mono uppercase tracking-wider" value={draft.code} onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })} />
        <Input label="Descrição" placeholder="Ex.: Campanha de regresso às aulas" hint="Só para uso interno." value={draft.description} onChange={(e) => set({ description: e.target.value })} />
        <SelectField
          label="Tipo de desconto *"
          value={draft.type}
          options={[{ value: "percentage", label: "Percentagem (máx. 90%)" }, { value: "fixed_amount", label: "Valor fixo em Kz" }]}
          onValueChange={(v) => set({ type: v as Draft["type"], value: "" })}
        />
        {draft.type === "percentage" ? (
          <Input label="Desconto em % *" inputMode="decimal" placeholder="Ex.: 15" hint="Entre 1 e 90." endIcon="Percent" value={draft.value} onChange={(e) => set({ value: e.target.value.replace(/[^\d.]/g, "") })} />
        ) : (
          <InputCurrency label="Desconto em Kz *" placeholder="Ex.: 5.000,00" suffix=" Kz" hint="Valor abatido ao total da ordem." value={draft.value} onValueChange={(n) => set({ value: n ? String(n) : "" })} />
        )}
      </FormSection>

      <FormSection icon="SlidersHorizontal" title="Regras de utilização" description="Quando e quantas vezes o cupão pode ser usado.">
        <Input label="Utilizações por escola *" inputMode="numeric" placeholder="Ex.: 1" hint="Quantas vezes a mesma escola o pode usar." value={draft.perSchool} onChange={(e) => set({ perSchool: digits(e.target.value) })} />
        <Input label="Máximo de utilizações (total)" inputMode="numeric" placeholder="Sem limite" hint="Esgota quando chega a este número." value={draft.total} onChange={(e) => set({ total: digits(e.target.value) })} />
        <Input label="Período mínimo (meses)" inputMode="numeric" placeholder="Qualquer período" hint="Só vale para ordens com pelo menos estes meses." value={draft.minMonths} onChange={(e) => set({ minMonths: digits(e.target.value) })} />
        <SelectField
          label="Plano aplicável"
          value={draft.plan || "todos"}
          options={[{ value: "todos", label: "Todos os planos" }, ...(plans.data ?? []).map((p) => ({ value: p.code, label: p.name }))]}
          onValueChange={(v) => set({ plan: v === "todos" ? "" : v })}
        />
        <Input type="date" label="Começa em" hint="Vazio = já pode ser usado." value={draft.starts} onChange={(e) => set({ starts: e.target.value })} />
        <Input type="date" label="Termina em (inclusive)" hint="Vazio = nunca expira." value={draft.ends} onChange={(e) => set({ ends: e.target.value })} />
      </FormSection>

      <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-3">
        <div>
          <p className="text-sm font-semibold">Cupão activo</p>
          <p className="text-xs text-muted-foreground">Se desactivado, a cotação recusa este código. O desconto nunca passa de 90% do total e só se gasta quando a ordem é aprovada.</p>
        </div>
        <Switch checked={draft.active} onCheckedChange={(c) => set({ active: c })} />
      </div>
    </div>
  );
}

/** Criar ou editar um cupão. Abre com `openModal("coupon-form", coupon?)`. */
export function CouponFormModal() {
  const draftRef = useRef<Draft | null>(null);
  const { create, update } = useCouponActions();

  return (
    <ReasonModal<AdminCoupon | undefined>
      id={COUPON_FORM_MODAL}
      title="Cupão"
      icon="Ticket"
      confirmIcon="Save"
      size="lg"
      description={(c) => (c ? `Editar ${c.code} (${c.uses_count} utilização(ões) até agora).` : "Criar um cupão de desconto.")}
      confirmLabel="Guardar"
      onConfirm={async ({ reason }, coupon) => {
        const d = draftRef.current;
        try {
          if (!d || (!coupon && d.code.length < 3) || !d.value || Number(d.value) <= 0) throw new Error("Indique o código (mínimo 3 caracteres) e o valor do desconto.");
          const body = {
            description: d.description.trim() || undefined,
            discount_type: d.type,
            discount_value: Number(d.value).toFixed(2),
            max_uses_per_school: Number(d.perSchool || 1),
            max_total_uses: d.total ? Number(d.total) : null,
            min_period_months: d.minMonths ? Number(d.minMonths) : null,
            applicable_plan_code: d.plan || null,
            starts_at: toIso(d.starts),
            expires_at: toIso(d.ends, true),
            is_active: d.active,
            reason,
          };
          if (coupon) await update.mutateAsync({ id: coupon.id, body });
          else await create.mutateAsync({ ...body, code: d.code });
          SuccessMessage(coupon ? "Cupão actualizado." : "Cupão criado.");
        } catch (e) {
          ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar o cupão."));
          throw e;
        }
      }}
    >
      {(coupon) => <CouponFields key={coupon?.id ?? "novo"} coupon={coupon} draftRef={draftRef} />}
    </ReasonModal>
  );
}
