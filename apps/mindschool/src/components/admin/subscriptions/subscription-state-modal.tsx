"use client";

import { ReasonModal } from "@workspace/ui";
import { useOrderActions } from "@/hooks/commerce/use-subscriptions";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import { SUBSCRIPTION_STATE_MODAL } from "./subscriptions-table";

interface Target {
  school: { id: string; name: string };
  action: "suspend" | "reactivate";
}

/** Suspender ou reactivar a subscrição de uma escola (motivo + reautenticação). Abre com `openModal("subscription-state", { school, action })`. */
export function SubscriptionStateModal() {
  const { suspend, reactivate } = useOrderActions();
  return (
    <ReasonModal<Target>
      id={SUBSCRIPTION_STATE_MODAL}
      icon="Wallet"
      title="Estado da subscrição"
      description={(t) => (t ? `${t.action === "suspend" ? "A escola passa a modo de leitura" : "A escola volta a ter acesso completo"}: ${t.school.name}.` : undefined)}
      confirmLabel="Confirmar"
      onConfirm={async ({ reason }, t) => {
        if (!t) return;
        try {
          await (t.action === "suspend" ? suspend : reactivate).mutateAsync({ schoolId: t.school.id, reason });
          SuccessMessage(t.action === "suspend" ? "Subscrição suspensa: a escola passa a modo de leitura." : "Subscrição reactivada.");
        } catch (e) {
          ErrorMessage(getApiErrorMessage(e, "A operação falhou."));
          throw e;
        }
      }}
    />
  );
}
