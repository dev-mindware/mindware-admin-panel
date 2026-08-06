"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Field,
  FieldContent,
  FieldLabel,
  GlobalModal,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useAffiliates, useMindgestClientsByAffiliate } from "@/hooks/affiliate";
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

const emptyForm = {
  external_payment_id: "",
  affiliate_code: "",
  client_id: "",
  client_name: "",
  client_identifier: "",
  plan_code: "BASE" as PartnerPlanCode,
  amount_paid: "",
  paid_at: "",
  billing_period: "monthly_first" as BillingPeriod,
  notes: "",
};

export function SubscriptionModals() {
  const { modalData, closeModal } = useModalStore();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateSubscriptionStatus();
  const { mutate: registerPayment, isPending: isRegistering } = useRegisterSubscriptionPayment();
  const { data: affiliates } = useAffiliates({ status: AffiliateStatus.ACTIVE });

  const subscription = modalData["update-subscription-status"] as PartnerSubscription | undefined;
  const registerModalData = modalData["register-subscription-payment"] as (Affiliate & { codigo_afiliado?: string }) | undefined;
  const initialAffiliateCode = registerModalData?.codigo_afiliado || "";

  const [notes, setNotes] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialAffiliateCode) {
      setForm((prev) => ({ ...prev, affiliate_code: initialAffiliateCode, client_id: "", client_name: "", client_identifier: "" }));
    }
  }, [initialAffiliateCode]);

  const selectedAffiliate = useMemo(() => {
    const fromList = (affiliates || []).find((a) => a.codigo_afiliado === form.affiliate_code);
    if (fromList) return fromList;
    if (registerModalData?.id && registerModalData.codigo_afiliado === form.affiliate_code) {
      return registerModalData;
    }
    return undefined;
  }, [affiliates, form.affiliate_code, registerModalData]);

  const {
    data: clients = [],
    isLoading: isLoadingClients,
    isError: isClientsError,
  } = useMindgestClientsByAffiliate(selectedAffiliate?.id);

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleAffiliateChange = (code: string) => {
    setForm((prev) => ({
      ...prev,
      affiliate_code: code,
      client_id: "",
      client_name: "",
      client_identifier: "",
    }));
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      setForm((prev) => ({
        ...prev,
        client_id: "",
        client_name: "",
        client_identifier: "",
      }));
      return;
    }

    const plan = (client.current_plan || "").toUpperCase() as PartnerPlanCode;
    const plan_code = planCodes.includes(plan) ? plan : form.plan_code;

    setForm((prev) => ({
      ...prev,
      client_id: client.id,
      client_name: client.company_name || client.name || "",
      client_identifier: client.company_tax_number || client.tax_number || "",
      plan_code,
    }));
  };

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
    if (!form.client_id) {
      toast.error("Selecione um cliente Mindgest.");
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
          setForm(emptyForm);
        },
        onError: (error: any) => toast.error(error.response?.data?.detail || "Erro ao registar o pagamento."),
      },
    );
  };

  const affiliateOptions = useMemo(() => {
    const map = new Map<string, Affiliate>();
    for (const aff of affiliates || []) {
      if (aff.codigo_afiliado) map.set(aff.codigo_afiliado, aff);
    }
    if (registerModalData?.codigo_afiliado && registerModalData.id) {
      map.set(registerModalData.codigo_afiliado, registerModalData);
    }
    return Array.from(map.values());
  }, [affiliates, registerModalData]);

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
                <Input
                  value={form.external_payment_id}
                  onChange={(e) => setField("external_payment_id", e.target.value)}
                  placeholder="pay_..."
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Afiliado *</FieldLabel>
              <FieldContent>
                <Select
                  value={form.affiliate_code || undefined}
                  onValueChange={handleAffiliateChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar afiliado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {affiliateOptions.map((aff) => (
                      <SelectItem key={aff.id} value={aff.codigo_afiliado}>
                        {aff.nome_completo} ({aff.codigo_afiliado})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>Cliente Mindgest *</FieldLabel>
              <FieldContent>
                <Select
                  value={form.client_id || undefined}
                  onValueChange={handleClientChange}
                  disabled={!selectedAffiliate?.id || isLoadingClients}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !selectedAffiliate
                          ? "Selecione o afiliado primeiro"
                          : isLoadingClients
                            ? "A carregar clientes..."
                            : isClientsError
                              ? "Erro ao carregar clientes"
                              : clients.length === 0
                                ? "Nenhum cliente Mindgest encontrado"
                                : "Selecionar cliente..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => {
                      const label =
                        client.company_name || client.name || "Cliente sem nome";
                      const nif = client.company_tax_number || client.tax_number || "Sem NIF";
                      return (
                        <SelectItem key={client.id} value={client.id}>
                          {label} — {nif}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {form.client_name && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {form.client_name}
                    {form.client_identifier ? ` · NIF ${form.client_identifier}` : ""}
                  </p>
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Plano</FieldLabel>
              <FieldContent>
                <Select
                  value={form.plan_code}
                  onValueChange={(value) => setField("plan_code", value as PartnerPlanCode)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {planCodes.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Período de faturação</FieldLabel>
              <FieldContent>
                <Select
                  value={form.billing_period}
                  onValueChange={(value) => setField("billing_period", value as BillingPeriod)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    {billingPeriods.map((bp) => (
                      <SelectItem key={bp.value} value={bp.value}>
                        {bp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Valor pago (Kz) *</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount_paid}
                  onChange={(e) => setField("amount_paid", e.target.value)}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Pago em</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={form.paid_at}
                  onChange={(e) => setField("paid_at", e.target.value)}
                />
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel>Notas (opcional)</FieldLabel>
            <FieldContent>
              <Textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                className="min-h-[60px]"
              />
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
