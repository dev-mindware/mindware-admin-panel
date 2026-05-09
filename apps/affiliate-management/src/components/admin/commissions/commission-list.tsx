"use client";

import { useCommissions, useApproveCommission, useRejectCommission } from "@/hooks/affiliate";
import {
    GenericTable,
    Column,
    ListSkeleton,
    RequestError,
    ItemStatusBadge,
    ButtonOnlyAction,
    FilterBar,
    Badge,
} from "@workspace/ui";
import { Commission, CommissionStatus } from "@workspace/types/affiliate";
import { formatDate, formatCurrency } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { useState } from "react";

export function CommissionList() {
    const [status, setStatus] = useState<CommissionStatus | undefined>();

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
        goToPreviousPage,
    } = useCommissions({ status });
    
    const { openModal } = useModalStore();

    const columns: Column<Commission>[] = [
        {
            key: "client_nome",
            header: "Cliente",
            render: (_, item) => (
                <div className="font-medium text-foreground">{item.client_nome}</div>
            ),
        },
        {
            key: "affiliate_nome",
            header: "Afiliado",
            render: (_, item) => (
                <div className="text-sm text-primary font-medium">{item.affiliate_nome || "—"}</div>
            ),
        },
        {
            key: "valor_servico",
            header: "Valor Venda",
            render: (_, item) => (
                <div className="text-sm text-foreground">
                    {formatCurrency(item.valor_servico)}
                </div>
            ),
        },
        {
            key: "valor_comissao",
            header: "Comissão",
            render: (_, item) => (
                <div className="text-sm font-semibold text-primary">
                    {formatCurrency(item.valor_comissao)}
                </div>
            ),
        },
        {
            key: "data",
            header: "Data",
            render: (_, item) => (
                <div className="text-sm text-muted-foreground">{formatDate(item.created_at)}</div>
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
            key: "action",
            header: "Ações",
            render: (_, item) => (
                <ButtonOnlyAction
                    data={item}
                    actions={[
                        {
                            label: "Ver Detalhes",
                            icon: "Info",
                            onClick: (data) => openModal("view-commission-details", data),
                        },
                        ...(item.status === CommissionStatus.PENDING ? [{
                            label: "Aprovar Comissão",
                            icon: "Check",
                            onClick: (data: Commission) => openModal("approve-commission", data),
                        }] as any : []),
                        ...(item.status === CommissionStatus.PENDING ? [{
                            label: "Rejeitar",
                            icon: "X",
                            variant: "destructive",
                            onClick: (data: Commission) => openModal("reject-commission", data),
                        }] as any : []),
                    ]}
                />
            ),
        },
    ];

    if (isLoading) return <ListSkeleton />;

    if (isError) {
        return <RequestError refetch={refetch} message="Erro ao carregar comissões" />;
    }

    return (
        <div className="space-y-4">
            <FilterBar 
                label="Filtrar por Status"
                value={status || ""}
                onValueChange={(val) => setStatus(val as CommissionStatus)}
                options={[
                    { label: "Pendente", value: CommissionStatus.PENDING },
                    { label: "Aprovado", value: CommissionStatus.APPROVED },
                    { label: "Pago", value: CommissionStatus.PAID },
                    { label: "Rejeitado", value: CommissionStatus.REJECTED },
                ]}
            />

            <GenericTable<Commission>
                data={data || []}
                columns={columns}
                page={page}
                total={total}
                totalPages={totalPages}
                setPage={setPage}
                goToNextPage={goToNextPage}
                goToPreviousPage={goToPreviousPage}
                emptyTitle="Nenhuma comissão encontrada"
                emptyDescription="Não existem comissões registradas no momento."
                emptyIcon="Coins"
            />
        </div>
    );
}
