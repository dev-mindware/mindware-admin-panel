"use client";

import { useState } from "react";
import { useCommissions } from "@/hooks/affiliate";
import {
  ButtonOnlyAction,
  Column,
  FilterBar,
  GenericTable,
  ItemStatusBadge,
  ListSkeleton,
  RequestError,
} from "@workspace/ui";
import { Commission, CommissionStatus } from "@workspace/types/affiliate";
import { formatCurrency, formatDate } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { MobileCard } from "@/components/shared/mobile-card";

export function CommissionList() {
  const [status, setStatus] = useState<CommissionStatus | undefined>();
  const { data, isLoading, isError, refetch, page, total, totalPages, setPage, goToNextPage, goToPreviousPage } =
    useCommissions({ status });
  const { openModal } = useModalStore();

  const buildActions = (item: Commission) => [
    { label: "Ver detalhes", icon: "Info" as const, onClick: (current: Commission) => openModal("view-commission-details", current) },
    ...(item.status === CommissionStatus.PENDING
      ? ([
          { label: "Aprovar comissão", icon: "Check", onClick: (current: Commission) => openModal("approve-commission", current) },
          {
            label: "Rejeitar",
            icon: "X",
            variant: "destructive",
            onClick: (current: Commission) => openModal("reject-commission", current),
          },
        ] as any)
      : []),
  ];

  const columns: Column<Commission>[] = [
    { key: "client_nome", header: "Cliente", render: (_, item) => <div className="font-medium">{item.client_nome}</div> },
    {
      key: "affiliate_nome",
      header: "Afiliado",
      render: (_, item) => <div className="text-sm font-medium text-primary">{item.affiliate_nome || "-"}</div>,
    },
    {
      key: "valor_servico",
      header: "Valor da venda",
      render: (_, item) => <div className="text-sm">{formatCurrency(item.valor_servico)}</div>,
    },
    {
      key: "valor_comissao",
      header: "Comissão",
      render: (_, item) => <div className="text-sm font-semibold text-primary">{formatCurrency(item.valor_comissao)}</div>,
    },
    {
      key: "data",
      header: "Data",
      render: (_, item) => <div className="text-sm text-muted-foreground">{formatDate(item.created_at)}</div>,
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={item.status} />,
    },
    {
      key: "action",
      header: "Ações",
      render: (_, item) => <ButtonOnlyAction data={item} actions={buildActions(item)} />,
    },
  ];

  if (isLoading) return <ListSkeleton />;
  if (isError) return <RequestError refetch={refetch} message="Erro ao carregar comissões." />;

  const items = data || [];

  return (
    <div className="space-y-4">
      <FilterBar
        label="Filtrar por estado"
        value={status || ""}
        onValueChange={(value) => setStatus((value || undefined) as CommissionStatus | undefined)}
        options={[
          { label: "Pendente", value: CommissionStatus.PENDING },
          { label: "Aprovado", value: CommissionStatus.APPROVED },
          { label: "Pago", value: CommissionStatus.PAID },
          { label: "Rejeitado", value: CommissionStatus.REJECTED },
        ]}
      />

      <div className="block space-y-3 sm:hidden">
        {items.length === 0 ? (
          <div className="rounded-2xl border bg-card px-4 py-8 text-center text-xs text-muted-foreground">
            Não existem comissões registadas no momento.
          </div>
        ) : (
          items.map((item) => (
            <MobileCard
              key={item.id}
              title={item.client_nome}
              subtitle={item.affiliate_nome || "Sem afiliado"}
              icon="Coins"
              badge={<ItemStatusBadge status={item.status} />}
              fields={[
                { label: "Venda", value: formatCurrency(item.valor_servico) },
                { label: "Comissão", value: formatCurrency(item.valor_comissao) },
                { label: "Data", value: formatDate(item.created_at) },
              ]}
              footerAction={<ButtonOnlyAction data={item} actions={buildActions(item)} />}
              onClick={() => openModal("view-commission-details", item)}
            />
          ))
        )}
      </div>

      <div className="hidden sm:block">
        <GenericTable<Commission>
          data={items}
          columns={columns}
          page={page}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyTitle="Nenhuma comissão encontrada"
          emptyDescription="Não existem comissões registadas no momento."
          emptyIcon="Coins"
        />
      </div>
    </div>
  );
}
