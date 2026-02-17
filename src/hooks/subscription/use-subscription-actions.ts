"use client";

import { Subscription, SubscriptionStatus } from "@/types";
import { useUpdateSubscriptionStatus } from "./use-subscriptions";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

export function useSubscriptionActions() {
    const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateSubscriptionStatus();

    async function handleUpdateStatus(subscription: Subscription, newStatus: SubscriptionStatus) {
        try {
            await updateStatus({ id: subscription.id, status: newStatus });
            SucessMessage(`Subscrição ${newStatus === "ACTIVE" ? "activada" : "cancelada"} com sucesso!`);
        } catch (error: any) {
            ErrorMessage(error?.response?.data?.message || "Erro ao atualizar status da subscrição");
        }
    }

    function getAvailableActions(subscription: Subscription) {
        const actions = [];

        if (subscription.status === "PENDING") {
            actions.push({
                label: "Ativar",
                icon: "Check" as const,
                onClick: (item: Subscription) => handleUpdateStatus(item, "ACTIVE"),
            });
            actions.push({
                label: "Cancelar",
                icon: "X" as const,
                variant: "destructive" as const,
                onClick: (item: Subscription) => handleUpdateStatus(item, "CANCELLED"),
            });
        } else if (subscription.status === "ACTIVE") {
            actions.push({
                label: "Cancelar",
                icon: "X" as const,
                variant: "destructive" as const,
                onClick: (item: Subscription) => handleUpdateStatus(item, "CANCELLED"),
            });
        }

        return actions;
    }

    return {
        isUpdating,
        handleUpdateStatus,
        getAvailableActions,
    };
}
