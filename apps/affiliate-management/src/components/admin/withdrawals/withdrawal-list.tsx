"use client";

import { useWithdrawalRequests, useApproveWithdrawal, useRejectWithdrawal } from "@/hooks/affiliate";
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
import { formatDate, formatCurrency } from "@workspace/utils";
import { WithdrawalRequest, WithdrawalStatus } from "@workspace/types/affiliate";
import { useModalStore } from "@workspace/hooks";
import { useState } from "react";

export function WithdrawalList() {
    const [status, setStatus] = useState<WithdrawalStatus | undefined>();

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
    } = useWithdrawalRequests({ status });
    
    const { openModal } = useModalStore();

    const columns: Column<WithdrawalRequest>[] = [
        // ... (colunas permanecem iguais)
        {
            key: "affiliate_nome",
            header: "Afiliado",
            render: (_, item) => (
                <div className="font-medium text-foreground">{item.affiliate_nome}</div>
            ),
        },
        {
            key: "valor",
            header: "Valor Solicitado",
            render: (_, item) => (
                <div className="text-sm font-semibold text-primary">
                    {formatCurrency(item.valor)}
                </div>
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
            key: "requestedAt",
            header: "Data Solicitação",
            render: (_, item) => (
                <div className="text-sm text-muted-foreground">
                    {formatDate(item.requested_at)}
                </div>
            ),
        },
        {
            key: "action",
            header: "Ações",
            render: (_, item) => (
                <ButtonOnlyAction
                    data={item}
                    actions={[
                        ...(item.status === WithdrawalStatus.PENDING ? [{
                            label: "Confirmar Pagamento",
                            icon: "Check",
                            onClick: (data: WithdrawalRequest) => openModal("approve-withdrawal", data),
                        }] as any : []),
                        ...(item.status === WithdrawalStatus.PENDING ? [{
                            label: "Rejeitar",
                            icon: "X",
                            variant: "destructive",
                            onClick: (data: WithdrawalRequest) => openModal("reject-withdrawal", data),
                        }] as any : []),
                    ]}
                />
            ),
        },
    ];

    if (isLoading) return <ListSkeleton />;

    if (isError) {
        return <RequestError refetch={refetch} message="Erro ao carregar solicitações de saque" />;
    }

    return (
        <div className="space-y-4">
            <FilterBar 
                label="Filtrar por Status"
                value={status || ""}
                onValueChange={(val) => setStatus(val as WithdrawalStatus)}
                options={[
                    { label: "Pendente", value: WithdrawalStatus.PENDING },
                    { label: "Aprovado", value: WithdrawalStatus.APPROVED },
                    { label: "Rejeitado", value: WithdrawalStatus.REJECTED },
                ]}
            />

            <GenericTable<WithdrawalRequest>
                data={data || []}
                columns={columns}
                page={page}
                total={total}
                totalPages={totalPages}
                setPage={setPage}
                goToNextPage={goToNextPage}
                goToPreviousPage={goToPreviousPage}
                emptyTitle="Nenhum saque encontrado"
                emptyDescription="Não existem solicitações de saque para os filtros selecionados."
                emptyIcon="HandCoins"
            />
        </div>
    );
}
