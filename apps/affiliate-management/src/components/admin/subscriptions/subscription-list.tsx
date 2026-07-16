"use client";

import { useState } from "react";
import {
  useAdminPartnerSubscriptions,
  useReleaseValidatedCommissions,
} from "@/hooks/affiliate/use-partner-program";
import {
  Badge,
  Button,
  ButtonOnlyAction,
  Column,
  FilterBar,
  GenericTable,
  ItemStatusBadge,
  ListSkeleton,
  RequestError,
} from "@workspace/ui";
import { PartnerSubscription } from "@workspace/types/affiliate";
import { formatCurrency, formatDate } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { toast } from "sonner";

const billingPeriodLabels: Record<string, string> = {
  monthly_first: "Mensal (1º)",
  monthly_recurring: "Mensal (recorrente)",
  annual_first: "Anual (1º)",
  annual_recurring: "Anual (recorrente)",
};

const sourceLabels: Record<string, string> = {
  manual: "Manual",
  webhook: "Webhook",
};

export function SubscriptionList() {
  const [status, setStatus] = useState<string | undefined>();
  const [source, setSource] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, refetch } = useAdminPartnerSubscriptions({ status, source, page, limit });
  const { openModal } = useModalStore();
  const { mutate: releaseValidated, isPending: isReleasing } = useReleaseValidatedCommissions();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  const handleRelease = () => {
    releaseValidated(undefined, {
      onSuccess: (res: any) => toast.success(`Comissões validadas libertadas: ${res?.data?.released ?? 0}.`),
      onError: (error: any) => toast.error(error.response?.data?.detail || "Erro ao libertar comissões."),
    });
  };

  const columns: Column<PartnerSubscription>[] = [
    {
      key: "client_name",
      header: "Cliente",
      render: (_, item) => (
        <div>
          <p className="font-medium text-foreground">{item.client_name}</p>
          <p className="text-xs text-muted-foreground">{item.client_identifier}</p>
        </div>
      ),
    },
    {
      key: "affiliate_nome",
      header: "Afiliado",
      render: (_, item) => (
        <div className="text-sm">
          <p className="font-medium text-primary">{item.affiliate_nome || "-"}</p>
          <p className="text-xs text-muted-foreground">{item.affiliate_codigo || ""}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plano",
      render: (_, item) => <Badge variant="secondary">{item.plan_code || item.plan_name || "-"}</Badge>,
    },
    {
      key: "amount_paid",
      header: "Valor",
      render: (_, item) => <div className="text-sm font-semibold text-primary">{formatCurrency(item.amount_paid)}</div>,
    },
    {
      key: "billing_period",
      header: "Período",
      render: (_, item) => (
        <span className="text-sm">{billingPeriodLabels[item.billing_period] ?? item.billing_period}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={item.status} />,
    },
    {
      key: "source",
      header: "Origem",
      render: (_, item) => (
        <Badge variant={item.source === "manual" ? "outline" : "default"}>
          {sourceLabels[item.source] ?? item.source}
        </Badge>
      ),
    },
    {
      key: "paid_at",
      header: "Data",
      render: (_, item) => <div className="text-sm text-muted-foreground">{formatDate(item.paid_at || item.created_at)}</div>,
    },
    {
      key: "action",
      header: "Ações",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: "Mudar estado",
              icon: "RefreshCw",
              onClick: (current) => openModal("update-subscription-status", current),
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading) return <ListSkeleton />;
  if (isError) return <RequestError refetch={refetch} message="Erro ao carregar subscrições." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <FilterBar
            label="Estado"
            value={status || ""}
            onValueChange={(value) => {
              setStatus((value || undefined) as string | undefined);
              setPage(1);
            }}
            options={[
              { label: "Ativa", value: "active" },
              { label: "Cancelada", value: "cancelled" },
              { label: "Pagamento falhou", value: "payment_failed" },
              { label: "Suspensa", value: "suspended" },
              { label: "Reembolsada", value: "refunded" },
              { label: "Chargeback", value: "chargeback" },
            ]}
          />
          <FilterBar
            label="Origem"
            value={source || ""}
            onValueChange={(value) => {
              setSource((value || undefined) as string | undefined);
              setPage(1);
            }}
            options={[
              { label: "Manual", value: "manual" },
              { label: "Webhook", value: "webhook" },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" loading={isReleasing} onClick={handleRelease}>
            Libertar comissões validadas
          </Button>
          <Button onClick={() => openModal("register-subscription-payment", {})}>Registar pagamento</Button>
        </div>
      </div>

      <GenericTable<PartnerSubscription>
        data={items}
        columns={columns}
        page={page}
        total={total}
        totalPages={totalPages}
        setPage={setPage}
        goToNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
        goToPreviousPage={() => setPage((p) => Math.max(1, p - 1))}
        emptyTitle="Nenhuma subscrição encontrada"
        emptyDescription="Ainda não existem subscrições registadas ou com estes filtros."
        emptyIcon="CreditCard"
      />
    </div>
  );
}
