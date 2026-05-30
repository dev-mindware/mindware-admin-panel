"use client";

import { useAdminPartnerPlans } from "@/hooks/affiliate";
import {
  Badge,
  Column,
  GenericTable,
  ListSkeleton,
  RequestError,
} from "@workspace/ui";
import { PartnerProgramPlan } from "@workspace/types/affiliate";
import { formatCurrency } from "@workspace/utils";

export function PartnerPlanList() {
  const { data, isLoading, isError, refetch } = useAdminPartnerPlans();
  const total = data?.length || 0;

  const columns: Column<PartnerProgramPlan>[] = [
    {
      key: "name",
      header: "Plano",
      render: (_, item) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.code}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Valor base",
      render: (_, item) => (
        <div className="text-sm">
          {item.code === "CUSTOM" && item.minimum_custom_price
            ? `A partir de ${formatCurrency(item.minimum_custom_price)}`
            : formatCurrency(item.price)}
        </div>
      ),
    },
    {
      key: "first_monthly_percent",
      header: "Primeiro pagamento",
      render: (_, item) => <span className="text-sm font-medium">{item.first_monthly_percent}%</span>,
    },
    {
      key: "recurring_monthly_percent",
      header: "Recorrente",
      render: (_, item) => <span className="text-sm font-medium">{item.recurring_monthly_percent}%</span>,
    },
    {
      key: "annual_first_percent",
      header: "Anual",
      render: (_, item) => <span className="text-sm font-medium">{item.annual_first_percent}%</span>,
    },
    {
      key: "certified_only",
      header: "Disponibilidade",
      render: (_, item) => (
        <Badge variant={item.certified_only ? "secondary" : "default"}>
          {item.certified_only ? "Certificados" : "Todos"}
        </Badge>
      ),
    },
    {
      key: "active",
      header: "Estado",
      render: (_, item) => (
        <Badge variant={item.active ? "default" : "secondary"}>
          {item.active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
  ];

  if (isLoading) return <ListSkeleton />;
  if (isError) return <RequestError refetch={refetch} message="Erro ao carregar planos Mindgest." />;

  return (
    <GenericTable<PartnerProgramPlan>
      data={data || []}
      columns={columns}
      page={1}
      total={total}
      totalPages={1}
      setPage={() => undefined}
      goToNextPage={() => undefined}
      goToPreviousPage={() => undefined}
      emptyTitle="Nenhum plano encontrado"
      emptyDescription="Ainda não existem planos Mindgest configurados."
      emptyIcon="BadgePercent"
    />
  );
}
