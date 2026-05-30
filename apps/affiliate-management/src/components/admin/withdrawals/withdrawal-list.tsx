"use client";

import { useState } from "react";
import { useWithdrawalRequests } from "@/hooks/affiliate";
import {
  ButtonOnlyAction,
  Column,
  FilterBar,
  GenericTable,
  ItemStatusBadge,
  ListSkeleton,
  RequestError,
} from "@workspace/ui";
import { formatCurrency, formatDate } from "@workspace/utils";
import { WithdrawalRequest, WithdrawalStatus } from "@workspace/types/affiliate";
import { useModalStore } from "@workspace/hooks";

export function WithdrawalList() {
  const [status, setStatus] = useState<WithdrawalStatus | undefined>();
  const { data, isLoading, isError, refetch, page, total, totalPages, setPage, goToNextPage, goToPreviousPage } =
    useWithdrawalRequests({ status });
  const { openModal } = useModalStore();

  const columns: Column<WithdrawalRequest>[] = [
    {
      key: "affiliate_nome",
      header: "Afiliado",
      render: (_, item) => <div className="font-medium text-foreground">{item.affiliate_nome}</div>,
    },
    {
      key: "valor",
      header: "Valor solicitado",
      render: (_, item) => <div className="text-sm font-semibold text-primary">{formatCurrency(item.valor)}</div>,
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={item.status} />,
    },
    {
      key: "requestedAt",
      header: "Data da solicitação",
      render: (_, item) => <div className="text-sm text-muted-foreground">{formatDate(item.created_at)}</div>,
    },
    {
      key: "action",
      header: "Ações",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            ...(item.status === WithdrawalStatus.PENDING
              ? ([
                  { label: "Confirmar pagamento", icon: "Check", onClick: (current: WithdrawalRequest) => openModal("approve-withdrawal", current) },
                  {
                    label: "Rejeitar",
                    icon: "X",
                    variant: "destructive",
                    onClick: (current: WithdrawalRequest) => openModal("reject-withdrawal", current),
                  },
                ] as any)
              : []),
          ]}
        />
      ),
    },
  ];

  if (isLoading) return <ListSkeleton />;
  if (isError) return <RequestError refetch={refetch} message="Erro ao carregar solicitações de levantamento." />;

  return (
    <div className="space-y-4">
      <FilterBar
        label="Filtrar por estado"
        value={status || ""}
        onValueChange={(value) => setStatus((value || undefined) as WithdrawalStatus | undefined)}
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
        emptyTitle="Nenhum levantamento encontrado"
        emptyDescription="Não existem solicitações de levantamento para os filtros selecionados."
        emptyIcon="HandCoins"
      />
    </div>
  );
}
