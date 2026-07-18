"use client";

import {
    useAdminPlans,
    useDeletePlan
} from "@/hooks/plans";
import { Plan } from "@/types/plan";
import {
    Button,
    Icon,
    ConfirmModal,
} from "@/components";
import { CONFIRM_MODAL_ID } from "@/components/custom/confirm-modal";
import { PlanList } from "./plan-list";
import { PlanFormModal } from "./plan-form-modal";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores/modal/use-modal-store";

export function PlansClient() {
    const { plans, isLoading } = useAdminPlans();
    const deleteMutation = useDeletePlan();
    const { openModal } = useModal();

    const handleCreate = () => {
        openModal("manage-plan");
    };

    const handleEdit = (plan: Plan) => {
        openModal("manage-plan", { plan });
    };

    const handleDelete = (plan: Plan) => {
        openModal(CONFIRM_MODAL_ID, {
            title: "Tem a certeza?",
            description: `Esta ação não pode ser desfeita. O plano "${plan.name}" será permanentemente removido do sistema.`,
            confirmLabel: "Eliminar Plano",
            loadingLabel: "A eliminar...",
            destructive: true,
            onConfirm: async () => {
                try {
                    await deleteMutation.mutateAsync(plan.id);
                    SucessMessage("Plano eliminado com sucesso!");
                } catch (error: any) {
                    ErrorMessage(error?.response?.data?.message || "Erro ao eliminar o plano");
                    throw error;
                }
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Icon name="Trophy" className="w-6 h-6 text-primary" />
                        Gestão de Planos
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        Configure e gira os planos de subscrição disponíveis no sistema.
                    </p>
                </div>
                <Button onClick={handleCreate} className="shadow-lg shadow-primary/20">
                    <Icon name="Plus" className="w-4 h-4 mr-2" />
                    Novo Plano
                </Button>
            </div>

            <PlanList
                plans={plans}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreate={handleCreate}
            />

            {/* Plan Form Modal */}
            <PlanFormModal />

            {/* Delete Confirmation */}
            <ConfirmModal />
        </div>
    );
}
