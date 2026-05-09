"use client";

import { Plan } from "@/types/plan";
import { PlanCard } from "./plan-card";
import { Skeleton, Icon, Button } from "@/components";

interface PlanListProps {
    plans: Plan[];
    isLoading?: boolean;
    onEdit?: (plan: Plan) => void;
    onDelete?: (plan: Plan) => void;
    onCreate?: () => void;
}

export function PlanList({ plans, isLoading, onEdit, onDelete, onCreate }: PlanListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[500px] w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg border border-dashed text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Icon name="Trophy" className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-bold">Nenhum plano encontrado</h3>
                <p className="text-muted-foreground text-sm max-w-xs mt-1 mb-6">
                    Ainda não foram criados planos de subscrição no sistema.
                </p>
                <Button onClick={onCreate}>
                    <Icon name="Plus" className="w-4 h-4 mr-2" />
                    Criar Primeiro Plano
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
            {plans.sort((a, b) => a.order - b.order).map((plan) => (
                <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
