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
import { MobileCard } from "@/components/shared/mobile-card";

export function PartnerPlanList() {
  const { data, isLoading, isError, refetch } = useAdminPartnerPlans();
  const total = data?.length || 0;
  const items = data || [];

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
      header: "Anual (1º)",
      render: (_, item) => <span className="text-sm font-medium">{item.annual_first_percent}%</span>,
    },
    {
      key: "annual_recurring_percent",
      header: "Anual (recorrente)",
      render: (_, item) => <span className="text-sm font-medium">{item.annual_recurring_percent ?? 0}%</span>,
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
    <div className="space-y-4">
      <div className="block space-y-3 sm:hidden">
        {items.length === 0 ? (
          <div className="rounded-2xl border bg-card px-4 py-8 text-center text-xs text-muted-foreground">
            Ainda não existem planos Mindgest configurados.
          </div>
        ) : (
          items.map((item) => (
            <MobileCard
              key={item.id || item.code}
              title={item.name}
              subtitle={item.code}
              icon="BadgePercent"
              badge={
                <Badge variant={item.active ? "default" : "secondary"}>
                  {item.active ? "Ativo" : "Inativo"}
                </Badge>
              }
              fields={[
                {
                  label: "Valor",
                  value:
                    item.code === "CUSTOM" && item.minimum_custom_price
                      ? `A partir de ${formatCurrency(item.minimum_custom_price)}`
                      : formatCurrency(item.price),
                },
                { label: "1º mês", value: `${item.first_monthly_percent}%` },
                { label: "Recorrente", value: `${item.recurring_monthly_percent}%` },
                {
                  label: "Disponível",
                  value: item.certified_only ? "Certificados" : "Todos",
                },
              ]}
            />
          ))
        )}
      </div>

      <div className="hidden sm:block">
        <GenericTable<PartnerProgramPlan>
          data={items}
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
      </div>
    </div>
  );
}
