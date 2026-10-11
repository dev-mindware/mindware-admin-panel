"use client";

import { useEffect, useRef, useState } from "react";
import { Checkbox, Input, ReasonModal, SelectField } from "@workspace/ui";
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Código *" disabled={Boolean(coupon)} placeholder="ex.: VOLTA26" value={draft.code} onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })} />
        <Input label="Descrição" placeholder="Para uso interno" value={draft.description} onChange={(e) => set({ description: e.target.value })} />
        <SelectField
          label="Tipo de desconto *"
          value={draft.type}
          options={[{ value: "percentage", label: "Percentagem (máx. 90%)" }, { value: "fixed_amount", label: "Valor fixo em Kz" }]}
          onValueChange={(v) => set({ type: v as Draft["type"] })}
        />
        <Input label={draft.type === "percentage" ? "Desconto em % *" : "Desconto em Kz *"} inputMode="decimal" value={draft.value} onChange={(e) => set({ value: e.target.value.replace(/[^\d.]/g, "") })} />
        <Input label="Utilizações por escola *" inputMode="numeric" value={draft.perSchool} onChange={(e) => set({ perSchool: digits(e.target.value) })} />
        <Input label="Máximo de utilizações (total)" inputMode="numeric" placeholder="vazio = sem limite" value={draft.total} onChange={(e) => set({ total: digits(e.target.value) })} />
        <Input label="Período mínimo (meses)" inputMode="numeric" placeholder="vazio = qualquer" value={draft.minMonths} onChange={(e) => set({ minMonths: digits(e.target.value) })} />
        <SelectField
          label="Plano aplicável"
          value={draft.plan || "todos"}
          options={[{ value: "todos", label: "Todos os planos" }, ...(plans.data ?? []).map((p) => ({ value: p.code, label: p.name }))]}
          onValueChange={(v) => set({ plan: v === "todos" ? "" : v })}
        />
        <Input type="date" label="Começa em" value={draft.starts} onChange={(e) => set({ starts: e.target.value })} />
        <Input type="date" label="Termina em (inclusive)" value={draft.ends} onChange={(e) => set({ ends: e.target.value })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={draft.active} onCheckedChange={(c) => set({ active: Boolean(c) })} />
        Activo (pode ser usado na cotação)
      </label>
      <p className="text-xs text-muted-foreground">O desconto nunca passa de 90% do total da ordem. O cupão só se gasta quando a ordem é aprovada.</p>
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
