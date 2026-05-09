"use client";

import { useAffiliates, useUpdateAffiliateStatus, useApproveAffiliate } from "@/hooks/affiliate";
import {
    GenericTable,
    Column,
    ListSkeleton,
    RequestError,
    ItemStatusBadge,
    ButtonOnlyAction,
    FilterBar,
} from "@workspace/ui";
import { Affiliate, AffiliateStatus } from "@workspace/types/affiliate";
import { formatDate, formatCurrency } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { AffiliateDetailsModal } from "./affiliate-details-modal";

import { useState } from "react";

export function AffiliateList() {
    const [status, setStatus] = useState<AffiliateStatus | undefined>();

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
    } = useAffiliates({ status });
    
    const { openModal } = useModalStore();
    const { mutate: updateStatus } = useUpdateAffiliateStatus();
    const { mutate: approveAffiliate } = useApproveAffiliate();

    const columns: Column<Affiliate>[] = [
        // ... (colunas permanecem iguais)
        {
            key: "nome_completo",
            header: "Nome",
            render: (_, item) => (
                <div className="font-medium text-foreground">{item.nome_completo}</div>
            ),
        },
        {
            key: "email",
            header: "Email/Telefone",
            render: (_, item) => (
                <div className="text-sm">
                    <div className="text-foreground">{item.email}</div>
                    <div className="text-muted-foreground">{item.telefone}</div>
                </div>
            ),
        },
        {
            key: "codigo_afiliado",
            header: "Código",
            render: (_, item) => (
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                    {item.codigo_afiliado || "N/A"}
                </code>
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
            key: "total_earned",
            header: "Ganhos Totais",
            render: (_, item) => (
                <div className="text-sm font-medium">
                    {formatCurrency(item.total_earned)}
                </div>
            ),
        },
        {
            key: "createdAt",
            header: "Aderiu em",
            render: (_, item) => (
                <div className="text-sm text-muted-foreground">
                    {formatDate(item.created_at)}
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
                        {
                            label: "Ver Detalhes",
                            icon: "Info",
                            onClick: (data) => openModal("view-affiliate-details", data),
                        },
                        ...(item.status === AffiliateStatus.PENDING_APPROVAL ? [{
                            label: "Aprovar Afiliado",
                            icon: "CircleCheck",
                            onClick: (data: Affiliate) => approveAffiliate(data.id),
                        }] as any : []),
                        ...(item.status === AffiliateStatus.INACTIVE || item.status === AffiliateStatus.SUSPENDED ? [{
                            label: "Ativar",
                            icon: "CirclePlay",
                            onClick: (data: Affiliate) => updateStatus({ id: data.id, status: AffiliateStatus.ACTIVE }),
                        }] as any : []),
                        ...(item.status === AffiliateStatus.ACTIVE ? [{
                            label: "Suspender",
                            icon: "TriangleAlert",
                            variant: "destructive",
                            onClick: (data: Affiliate) => updateStatus({ id: data.id, status: AffiliateStatus.SUSPENDED }),
                        }] as any : []),
                    ]}
                />
            ),
        },
    ];

    if (isLoading) return <ListSkeleton />;

    if (isError) {
        return <RequestError refetch={refetch} message="Erro ao carregar afiliados" />;
    }

    return (
        <div className="space-y-4">
            <FilterBar 
                label="Filtrar por Status"
                value={status || ""}
                onValueChange={(val) => setStatus(val as AffiliateStatus)}
                options={[
                    { label: "Pendente", value: AffiliateStatus.PENDING_APPROVAL },
                    { label: "Ativo", value: AffiliateStatus.ACTIVE },
                    { label: "Inativo", value: AffiliateStatus.INACTIVE },
                    { label: "Suspenso", value: AffiliateStatus.SUSPENDED },
                    { label: "Rejeitado", value: AffiliateStatus.REJECTED },
                ]}
            />

            <GenericTable<Affiliate>
                data={data || []}
                columns={columns}
                page={page}
                total={total}
                totalPages={totalPages}
                setPage={setPage}
                goToNextPage={goToNextPage}
                goToPreviousPage={goToPreviousPage}
                emptyTitle="Nenhum afiliado encontrado"
                emptyDescription="Ainda não existem afiliados cadastrados ou com este status."
                emptyIcon="Users"
            />

            <AffiliateDetailsModal />
        </div>
    );
}
