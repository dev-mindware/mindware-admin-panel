"use client";

import { useState } from "react";
import {
    useAdminPlans,
    useDeletePlan
} from "@/hooks/plans";
import { Plan } from "@/types/plan";
import {
    Button,
    Icon,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components";
import { PlanList } from "./plan-list";
import { PlanFormModal } from "./plan-form-modal";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores/modal/use-modal-store";

export function PlansClient() {
    const { plans, isLoading } = useAdminPlans();
    const deleteMutation = useDeletePlan();
    const { openModal, closeModal } = useModal();

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const handleCreate = () => {
        openModal("manage-plan");
    };

    const handleEdit = (plan: Plan) => {
        openModal("manage-plan", { plan });
    };

    const handleDelete = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsDeleteOpen(true);
    };

    const onConfirmDelete = async () => {
        if (!selectedPlan) return;
        try {
            await deleteMutation.mutateAsync(selectedPlan.id);
            SucessMessage("Plano eliminado com sucesso!");
            setIsDeleteOpen(false);
        } catch (error: any) {
            ErrorMessage(error?.response?.data?.message || "Erro ao eliminar o plano");
        }
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
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Icon name="BadgeAlert" className="w-5 h-5 text-destructive" />
                            Tem a certeza?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O plano <strong>{selectedPlan?.name}</strong> será permanentemente removido do sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "A eliminar..." : "Eliminar Plano"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
