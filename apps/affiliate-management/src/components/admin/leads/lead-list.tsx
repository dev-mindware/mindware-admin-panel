"use client";

import { useState } from "react";
import { useLeads, useUpdateLeadStatus } from "@/hooks/affiliate";
import {
  ButtonOnlyAction,
  Column,
  FilterBar,
  GenericTable,
  ItemStatusBadge,
  ListSkeleton,
  RequestError,
} from "@workspace/ui";
import { Lead, LeadStatus } from "@workspace/types/affiliate";
import { formatDate } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { MobileCard } from "@/components/shared/mobile-card";

export function LeadList() {
  const [status, setStatus] = useState<LeadStatus | undefined>();
  const { data, isLoading, isError, refetch, page, total, totalPages, setPage, goToNextPage, goToPreviousPage } =
    useLeads({ status });
  const { openModal } = useModalStore();
  const { mutate: updateStatus } = useUpdateLeadStatus();

  const buildActions = (item: Lead) => [
    {
      label: "Ver detalhes",
      icon: "Info" as const,
      onClick: (current: Lead) => openModal("view-lead-details", current),
    },
    ...(item.status === LeadStatus.NEW
      ? ([
          {
            label: "Marcar como contactado",
            icon: "Phone",
            onClick: (current: Lead) => updateStatus({ id: current.id, status: LeadStatus.CONTACTED }),
          },
        ] as any)
      : []),
    ...(item.status === LeadStatus.CONTACTED
      ? ([
          {
            label: "Converter em venda",
            icon: "Check",
            onClick: (current: Lead) => updateStatus({ id: current.id, status: LeadStatus.CONVERTED }),
          },
        ] as any)
      : []),
  ];

  const columns: Column<Lead>[] = [
    {
      key: "client_nome",
      header: "Cliente",
      render: (_, item) => <div className="font-medium text-foreground">{item.client_nome}</div>,
    },
    {
      key: "affiliate_nome",
      header: "Afiliado",
      render: (_, item) => <div className="text-sm font-medium text-primary">{item.affiliate_nome || "-"}</div>,
    },
    {
      key: "client_telefone",
      header: "Contacto",
      render: (_, item) => <div className="text-sm text-foreground">{item.client_telefone}</div>,
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={item.status} />,
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => <div className="text-sm text-muted-foreground">{formatDate(item.created_at)}</div>,
    },
    {
      key: "action",
      header: "Ações",
      render: (_, item) => <ButtonOnlyAction data={item} actions={buildActions(item)} />,
    },
  ];

  if (isLoading) return <ListSkeleton />;
  if (isError) return <RequestError refetch={refetch} message="Erro ao carregar leads." />;

  const items = data || [];

  return (
    <div className="space-y-4">
      <FilterBar
        label="Filtrar por estado"
        value={status || ""}
        onValueChange={(value) => setStatus((value || undefined) as LeadStatus | undefined)}
        options={[
          { label: "Novo", value: LeadStatus.NEW },
          { label: "Contactado", value: LeadStatus.CONTACTED },
          { label: "Convertido", value: LeadStatus.CONVERTED },
          { label: "Perdido", value: LeadStatus.LOST },
        ]}
      />

      <div className="block space-y-3 sm:hidden">
        {items.length === 0 ? (
          <div className="rounded-2xl border bg-card px-4 py-8 text-center text-xs text-muted-foreground">
            Não existem leads registados com este estado.
          </div>
        ) : (
          items.map((item) => (
            <MobileCard
              key={item.id}
              title={item.client_nome}
              subtitle={item.affiliate_nome || "Sem afiliado"}
              icon="UserPlus"
              badge={<ItemStatusBadge status={item.status} />}
              fields={[
                { label: "Contacto", value: item.client_telefone || "-" },
                { label: "Criado", value: formatDate(item.created_at) },
              ]}
              footerAction={<ButtonOnlyAction data={item} actions={buildActions(item)} />}
              onClick={() => openModal("view-lead-details", item)}
            />
          ))
        )}
      </div>

      <div className="hidden sm:block">
        <GenericTable<Lead>
          data={items}
          columns={columns}
          page={page}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyTitle="Nenhum lead encontrado"
          emptyDescription="Não existem leads registados com este estado."
          emptyIcon="UserPlus"
        />
      </div>

    </div>
  );
}
