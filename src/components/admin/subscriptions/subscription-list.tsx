"use client";

import { useSubscriptions, useSubscriptionActions, useSubscriptionFilters } from "@/hooks/subscription";
import {
    GenericTable,
    Column,
    ListSkeleton,
    RequestError,
    EmptyState,
    ItemStatusBadge,
    ButtonOnlyAction,
    SubscriptionFilters,
} from "@/components";
import { Subscription } from "@/types";
import { formatDateTime } from "@/utils";
import { useModal } from "@/stores/modal/use-modal-store";
import { ProofViewerModal } from "./proof-viewer-modal";
import { SubscriptionDetailsModal } from "./subscription-details-modal";

export function SubscriptionList() {
    const { filters } = useSubscriptionFilters();
    const {
        data,
        isLoading,
        isError,
        refetch,
        page,
        total,
        totalPages,
        setPage,
        goToNextPage,
        goToPreviousPage
    } = useSubscriptions(filters);
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
                            label: "Comprovativo",
                            icon: "FileText",
                            onClick: (data) => openModal("view-proof", data.proofFileUrl),
                        },
                        {
                            label: "Ver Detalhes",
                            icon: "Info",
                            onClick: (data) => openModal("view-subscription-details", data),
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

    return (
        <div className="space-y-4">
            <SubscriptionFilters hasData={data && data.length > 0} />

            <GenericTable<Subscription>
                data={data || []}
                columns={columns}
                page={page}
                total={total}
                totalPages={totalPages}
                setPage={setPage}
                goToNextPage={goToNextPage}
                goToPreviousPage={goToPreviousPage}
                emptyMessage="Nenhuma subscrição encontrada com os filtros selecionados."
            />

            <ProofViewerModal />
            <SubscriptionDetailsModal />
        </div>
    );
}
