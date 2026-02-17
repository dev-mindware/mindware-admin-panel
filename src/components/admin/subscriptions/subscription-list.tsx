"use client";

import { useSubscriptions, useSubscriptionActions } from "@/hooks/subscription";
import {
    GenericTable,
    Column,
    ListSkeleton,
    RequestError,
    EmptyState,
    ItemStatusBadge,
    ButtonOnlyAction,
} from "@/components";
import { Subscription } from "@/types";
import { formatDateTime } from "@/utils";
import { useModal } from "@/stores/modal/use-modal-store";
import { ProofViewerModal } from "./proof-viewer-modal";

export function SubscriptionList() {
    const { data, isLoading, isError, refetch } = useSubscriptions();
    const { openModal } = useModal();
    const { getAvailableActions } = useSubscriptionActions();

    const columns: Column<Subscription>[] = [
        {
            key: "company",
            header: "Empresa",
            render: (_, item) => (
                <div className="font-medium text-foreground">{item.company.name}</div>
            ),
        },
        {
            key: "plan",
            header: "Plano",
            render: (_, item) => (
                <div className="text-sm text-foreground">{item.plan.name}</div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (_, item) => (
                <ItemStatusBadge status={item.status} />
            ),
        },
        {
            key: "periodEndsAt",
            header: "Expira em",
            render: (_, item) => (
                <div className="text-sm text-foreground">
                    {formatDateTime(item.periodEndsAt)}
                </div>
            ),
        },
        {
            key: "createdAt",
            header: "Criado em",
            render: (_, item) => (
                <div className="text-sm text-foreground">
                    {formatDateTime(item.createdAt)}
                </div>
            ),
        },
        {
            key: "action",
            header: "Ação",
            render: (_, item) => (
                <ButtonOnlyAction
                    data={item}
                    actions={[
                        {
                            label: "Ver Provativo",
                            icon: "FileText",
                            onClick: (data) => openModal("view-proof", data.proofFileUrl),
                        },
                        { type: "separator" },
                        ...getAvailableActions(item),
                    ]}
                />
            ),
        },
    ];

    if (isLoading) return <ListSkeleton />;

    if (isError) {
        return <RequestError refetch={refetch} message="Erro ao carregar subscrições" />;
    }

    if (!data || data.length === 0) {
        return (
            <EmptyState
                title="Sem subscrições"
                description="Nenhuma subscrição encontrada no sistema."
                icon="CreditCard"
            />
        );
    }

    return (
        <div className="space-y-4">
            <GenericTable<Subscription>
                data={data?.slice(0, 10) as any[]}
                columns={columns}
                page={1}
                total={data.length}
                totalPages={1}
                setPage={() => { }}
                goToNextPage={() => { }}
                goToPreviousPage={() => { }}
            />

            <ProofViewerModal />
        </div>
    );
}
