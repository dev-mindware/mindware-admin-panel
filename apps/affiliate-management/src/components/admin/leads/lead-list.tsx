"use client";

import { useLeads, useUpdateLeadStatus } from "@/hooks/affiliate";
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
import { Lead, LeadStatus } from "@workspace/types/affiliate";
import { formatDate } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";

import { LeadFormModal } from "./lead-form-modal";
import { useState } from "react";

export function LeadList() {
    const [status, setStatus] = useState<LeadStatus | undefined>();

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
    } = useLeads({ status });
    
    const { openModal } = useModalStore();
    const { mutate: updateStatus } = useUpdateLeadStatus();

    const columns: Column<Lead>[] = [
        // ... (colunas permanecem iguais)
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
            key: "client_telefone",
            header: "Contato",
            render: (_, item) => (
                <div className="text-sm text-foreground">{item.client_telefone}</div>
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
            key: "createdAt",
            header: "Criado em",
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
                            onClick: (data) => openModal("view-lead-details", data),
                        },
                        ...(item.status === LeadStatus.NEW ? [{
                            label: "Marcar como Contatado",
                            icon: "Phone",
                            onClick: (data: Lead) => updateStatus({ id: data.id, status: LeadStatus.CONTACTED }),
                        }] as any : []),
                        ...(item.status === LeadStatus.CONTACTED ? [{
                            label: "Converter em Venda",
                            icon: "Check",
                            onClick: (data: Lead) => updateStatus({ id: data.id, status: LeadStatus.CONVERTED }),
                        }] as any : []),
                    ]}
                />
            ),
        },
    ];

    if (isLoading) return <ListSkeleton />;

    if (isError) {
        return <RequestError refetch={refetch} message="Erro ao carregar leads" />;
    }

    return (
        <div className="space-y-4">
            <FilterBar 
                label="Filtrar por Status"
                value={status || ""}
                onValueChange={(val) => setStatus(val as LeadStatus)}
                options={[
                    { label: "Novo", value: LeadStatus.NEW },
                    { label: "Contatado", value: LeadStatus.CONTACTED },
                    { label: "Convertido", value: LeadStatus.CONVERTED },
                    { label: "Perdido", value: LeadStatus.LOST },
                ]}
            />

            <GenericTable<Lead>
                data={data || []}
                columns={columns}
                page={page}
                total={total}
                totalPages={totalPages}
                setPage={setPage}
                goToNextPage={goToNextPage}
                goToPreviousPage={goToPreviousPage}
                emptyTitle="Nenhum lead encontrado"
                emptyDescription="Não existem leads registrados com este status."
                emptyIcon="UserPlus"
            />

            <LeadFormModal />
        </div>
    );
}
