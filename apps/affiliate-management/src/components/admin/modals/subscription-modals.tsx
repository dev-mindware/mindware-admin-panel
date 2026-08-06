"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Field,
  FieldContent,
  FieldLabel,
  GlobalModal,
  Input,
  Textarea,
} from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useAffiliates } from "@/hooks/affiliate";
import {
  useRegisterSubscriptionPayment,
  useUpdateSubscriptionStatus,
} from "@/hooks/affiliate/use-partner-program";
import { PartnerPlanCode, PartnerSubscription, BillingPeriod, AffiliateStatus, Affiliate } from "@workspace/types/affiliate";
import { toast } from "sonner";

const statusOptions: { value: PartnerSubscription["status"]; label: string; variant?: "destructive" | "outline" }[] = [
  { value: "active", label: "Ativar" },
  { value: "suspended", label: "Suspender", variant: "outline" },
  { value: "payment_failed", label: "Pagamento falhou", variant: "outline" },
  { value: "cancelled", label: "Cancelar", variant: "destructive" },
  { value: "refunded", label: "Reembolsar", variant: "destructive" },
  { value: "chargeback", label: "Chargeback", variant: "destructive" },
];

const planCodes: PartnerPlanCode[] = ["BASE", "SMART", "PRO", "CUSTOM"];
const billingPeriods: { value: BillingPeriod; label: string }[] = [
  { value: "monthly_first", label: "Mensal (1º pagamento)" },
  { value: "monthly_recurring", label: "Mensal (recorrente)" },
  { value: "annual_first", label: "Anual (1º pagamento)" },
  { value: "annual_recurring", label: "Anual (recorrente)" },
];

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function SubscriptionModals() {
  const { modalData, closeModal } = useModalStore();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateSubscriptionStatus();
  const { mutate: registerPayment, isPending: isRegistering } = useRegisterSubscriptionPayment();
  const { data: affiliates } = useAffiliates({ status: AffiliateStatus.ACTIVE });

  const subscription = modalData["update-subscription-status"] as PartnerSubscription | undefined;
  const registerModalData = modalData["register-subscription-payment"] as (Affiliate & { codigo_afiliado?: string }) | undefined;
  const initialAffiliateCode = registerModalData?.codigo_afiliado || "";

  const [notes, setNotes] = useState("");
  const [form, setForm] = useState({
    external_payment_id: "",
    affiliate_code: "",
    client_name: "",
    client_identifier: "",
    plan_code: "BASE" as PartnerPlanCode,
    amount_paid: "",
    paid_at: "",
    billing_period: "monthly_first" as BillingPeriod,
    notes: "",
  });

  useEffect(() => {
    if (initialAffiliateCode) {
      setForm((prev) => ({ ...prev, affiliate_code: initialAffiliateCode }));
    }
  }, [initialAffiliateCode]);

  const setField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleUpdate = (status: PartnerSubscription["status"]) => {
    if (!subscription) return;
    updateStatus(
      { id: subscription.id, data: { status, notes: notes || undefined } },
      {
        onSuccess: () => {
          toast.success("Estado da subscrição atualizado.");
          setNotes("");
          closeModal("update-subscription-status");
        },
        onError: (error: any) => toast.error(error.response?.data?.detail || "Erro ao atualizar a subscrição."),
      },
    );
  };

  const handleRegister = () => {
    if (!form.affiliate_code || !form.client_name || !form.client_identifier || !form.amount_paid || !form.external_payment_id) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    registerPayment(
      {
        external_payment_id: form.external_payment_id,
        affiliate_code: form.affiliate_code,
        client_name: form.client_name,
        client_identifier: form.client_identifier,
        plan_code: form.plan_code,
        amount_paid: Number(form.amount_paid),
        paid_at: form.paid_at ? new Date(form.paid_at).toISOString() : new Date().toISOString(),
        billing_period: form.billing_period,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Pagamento registado e comissão processada.");
          closeModal("register-subscription-payment");
          setForm({
            external_payment_id: "",
            affiliate_code: "",
            client_name: "",
            client_identifier: "",
            plan_code: "BASE",
            amount_paid: "",
            paid_at: "",
            billing_period: "monthly_first",
            notes: "",
          });
        },
        onError: (error: any) => toast.error(error.response?.data?.detail || "Erro ao registar o pagamento."),
      },
    );
  };

  return (
    <>
      <GlobalModal
        id="update-subscription-status"
        title="Mudar estado da subscrição"
        description={subscription ? `Cliente: ${subscription.client_name} · Plano: ${subscription.plan_code || "-"}` : undefined}
      >
        <div className="space-y-5">
          <Field>
            <FieldLabel>Notas (opcional)</FieldLabel>
            <FieldContent>
              <Textarea
                placeholder="Motivo da alteração de estado…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </FieldContent>
          </Field>
          <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
            {statusOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={opt.variant || "default"}
                loading={isUpdating}
                onClick={() => handleUpdate(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </GlobalModal>

      <GlobalModal
        id="register-subscription-payment"
        title="Atribuir Subscrição Mindgest a Afiliado"
        description="Regista o pagamento de um cliente Mindgest e atribui a comissão ao afiliado correspondente."
      >
        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>ID de pagamento externo *</FieldLabel>
              <FieldContent>
                <Input value={form.external_payment_id} onChange={(e) => setField("external_payment_id", e.target.value)} placeholder="pay_..." />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Código do afiliado *</FieldLabel>
              <FieldContent className="space-y-2">
                {affiliates && affiliates.length > 0 && (
                  <select
                    className={selectClass}
                    value={affiliates.some((a) => a.codigo_afiliado === form.affiliate_code) ? form.affiliate_code : ""}
                    onChange={(e) => setField("affiliate_code", e.target.value)}
                  >
                    <option value="">Selecionar da lista...</option>
                    {affiliates.map((aff) => (
                      <option key={aff.id} value={aff.codigo_afiliado}>
                        {aff.nome_completo} ({aff.codigo_afiliado})
                      </option>
                    ))}
                  </select>
                )}
                <Input value={form.affiliate_code} onChange={(e) => setField("affiliate_code", e.target.value)} placeholder="MWD-AO-..." />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Nome do cliente *</FieldLabel>
              <FieldContent>
                <Input value={form.client_name} onChange={(e) => setField("client_name", e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Identificador do cliente (NIF) *</FieldLabel>
              <FieldContent>
                <Input value={form.client_identifier} onChange={(e) => setField("client_identifier", e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Plano</FieldLabel>
              <FieldContent>
                <select className={selectClass} value={form.plan_code} onChange={(e) => setField("plan_code", e.target.value)}>
                  {planCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Período de faturação</FieldLabel>
              <FieldContent>
                <select className={selectClass} value={form.billing_period} onChange={(e) => setField("billing_period", e.target.value)}>
                  {billingPeriods.map((bp) => (
                    <option key={bp.value} value={bp.value}>
                      {bp.label}
                    </option>
                  ))}
                </select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Valor pago (Kz) *</FieldLabel>
              <FieldContent>
                <Input type="number" step="0.01" value={form.amount_paid} onChange={(e) => setField("amount_paid", e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Pago em</FieldLabel>
              <FieldContent>
                <Input type="date" value={form.paid_at} onChange={(e) => setField("paid_at", e.target.value)} />
              </FieldContent>
            </Field>
          </div>
          <Field>
            <FieldLabel>Notas (opcional)</FieldLabel>
            <FieldContent>
              <Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} className="min-h-[60px]" />
            </FieldContent>
          </Field>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => closeModal("register-subscription-payment")}>
              Cancelar
            </Button>
            <Button loading={isRegistering} onClick={handleRegister}>
              Registar pagamento
            </Button>
          </div>
        </div>
      </GlobalModal>
    </>
  );
}
