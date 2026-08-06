"use client";

import { useState } from "react";
import {
  Button,
  Field,
  FieldContent,
  FieldLabel,
  GlobalModal,
  Textarea,
} from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useUpdateSubscriptionStatus } from "@/hooks/affiliate/use-partner-program";
import { PartnerSubscription } from "@workspace/types/affiliate";
import { toast } from "sonner";

const statusOptions: { value: PartnerSubscription["status"]; label: string; variant?: "destructive" | "outline" }[] = [
  { value: "active", label: "Ativar" },
  { value: "suspended", label: "Suspender", variant: "outline" },
  { value: "payment_failed", label: "Pagamento falhou", variant: "outline" },
  { value: "cancelled", label: "Cancelar", variant: "destructive" },
  { value: "refunded", label: "Reembolsar", variant: "destructive" },
  { value: "chargeback", label: "Chargeback", variant: "destructive" },
];

export function SubscriptionModals() {
  const { modalData, closeModal } = useModalStore();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateSubscriptionStatus();

  const subscription = modalData["update-subscription-status"] as PartnerSubscription | undefined;
  const [notes, setNotes] = useState("");

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

  return (
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
  );
}
