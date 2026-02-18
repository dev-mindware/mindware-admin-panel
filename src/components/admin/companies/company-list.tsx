"use client";

import { useCompanies, useCompanyFilters, useCompanyActions } from "@/hooks/company";
import {
    GenericTable,
    Column,
    ListSkeleton,
    RequestError,
    ItemStatusBadge,
    CompanyFilters,
    ButtonOnlyAction,
    CompanyDetailsModal,
} from "@/components";
import { Company } from "@/types";
import { formatDateTime } from "@/utils";

export function CompanyList() {
    const { filters } = useCompanyFilters();
    const {
        toggleStatus,
        isToggling,
        openViewDetails,
    } = useCompanyActions();

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
    } = useCompanies(filters);

    const columns: Column<Company>[] = [
        {
            key: "name",
            header: "Nome",
            render: (value) => <div className="font-medium text-foreground">{value}</div>,
        },
        {
            key: "email",
            header: "Email",
            render: (value) => <div className="text-sm text-foreground">{value}</div>,
        },
        {
            key: "taxNumber",
            header: "NIF",
            render: (value) => <div className="text-sm text-foreground">{value}</div>,
        },
        {
            key: "isActive",
            header: "Status",
            render: (value) => (
                <ItemStatusBadge status={value ? "ACTIVE" : "INACTIVE"} />
            ),
        },
        {
            key: "createdAt",
            header: "Criado em",
            render: (value) => (
                <div className="text-sm text-foreground">
                    {formatDateTime(value)}
                </div>
            ),
        },
        {
            key: "id",
            header: "Ações",
            render: (_, item) => (
                <ButtonOnlyAction
                    data={item}
                    actions={[
                        {
                            label: "Ver Detalhes",
                            icon: "Eye",
                            onClick: (data) => openViewDetails(data),
                        },
                        {
                            label: item.isActive ? "Desativar" : "Ativar",
                            icon: item.isActive ? "UserX" : "UserCheck",
                            variant: item.isActive ? "destructive" : "default",
                            onClick: (data) => toggleStatus(data.id),
                        },
                    ]}
                />
            ),
        },
    ];

    if (isLoading) return <ListSkeleton />;

    if (isError) {
        return <RequestError refetch={refetch} message="Erro ao carregar empresas" />;
    }

    return (
        <div className="space-y-4">
            <CompanyFilters hasData={data && data.length > 0} />

            <GenericTable<Company>
                data={data || []}
                columns={columns}
                page={page}
                total={total}
                totalPages={totalPages}
                setPage={setPage}
                goToNextPage={goToNextPage}
                goToPreviousPage={goToPreviousPage}
                emptyMessage="Nenhuma empresa encontrada com os filtros selecionados."
            />

            <CompanyDetailsModal />
        </div>
    );
}
