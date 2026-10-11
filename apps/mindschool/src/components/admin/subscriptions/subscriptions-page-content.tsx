"use client";

import { Button, DonutPanel, Icon, MetricGrid, ProofViewer, Tabs, TabsContent, TabsList, TabsTrigger, TitleList, BarListPanel } from "@workspace/ui";
import { useQueryState } from "nuqs";
import { ORDER_STATUS, SUBSCRIPTION_STATUS } from "@/constants/statuses";
import { PermissionGate } from "@/components/admin/shared/permission-gate";
import { useOrderActions, useSubscriptionStats } from "@/hooks/commerce/use-subscriptions";
import { subscriptionService } from "@/services/subscription-service";
import { getApiErrorMessage } from "@/utils/api-error";
import { slicesFromCounts } from "@/utils/charts";
import { kzShort } from "@/utils/format";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import { OrderReviewModal, PROOF_MODAL } from "./order-review-modal";
import { OrdersTable } from "./orders-table";
import { SubscriptionStateModal } from "./subscription-state-modal";
import { SubscriptionsTable } from "./subscriptions-table";

/**
 * Subscrições: o fluxo do MindGest (comprovativo → activar ou recusar) com a fila de trabalho à frente.
 * KPIs, três separadores (fila, ordens, subscrições vivas) e as acções de ciclo de vida.
 */
export function SubscriptionsPageContent() {
  const stats = useSubscriptionStats();
  const { sweep } = useOrderActions();
  const [tab, setTab] = useQueryState("tab", { defaultValue: "fila" });
  const s = stats.data;

  const runSweep = () =>
    sweep.mutate(undefined, {
      onSuccess: (r) => SuccessMessage(`Verificação concluída: ${r.trials_expired} teste(s) terminado(s), ${r.moved} subscrição(ões) movida(s), ${r.cancelled} cancelada(s).`),
      onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível executar a verificação.")),
    });

  const delta = s ? Number(s.revenue.month) - Number(s.revenue.previous_month) : 0;

  return (
    <div className="flex flex-col gap-6">
      <TitleList title="Subscrições" suTitle="Aprove comprovativos, acompanhe o estado de cada escola e mantenha o ciclo de vida em dia.">
        <PermissionGate permission="platform:subscription_manage">
          <Button variant="outline" size="sm" onClick={runSweep} loading={sweep.isPending} className="gap-2">
            <Icon name="RefreshCw" className="size-4" />
            Verificar expirações
          </Button>
        </PermissionGate>
      </TitleList>

      <MetricGrid
        isLoading={stats.isLoading}
        isError={stats.isError}
        onRetry={() => void stats.refetch()}
        items={
          s
            ? [
                { title: s.orders.by_status.payment_proof_submitted, subtitle: "Por rever", description: s.orders.stale_24h ? `${s.orders.stale_24h} há mais de 24 h` : "Fila em dia", icon: "Clock", variant: "action", onClick: () => void setTab("fila") },
                { title: kzShort(s.revenue.month), subtitle: "Receita do mês", description: `${delta >= 0 ? "+" : "−"}${kzShort(Math.abs(delta))} face ao mês anterior`, icon: "Banknote" },
                { title: kzShort(s.mrr), subtitle: "MRR", description: `${s.subscriptions.by_status.active} escola(s) a pagar`, icon: "TrendingUp" },
                { title: s.subscriptions.by_status.past_due + s.subscriptions.by_status.grace, subtitle: "Em atraso", description: "Vencidas e em tolerância", icon: "CircleAlert", variant: s.subscriptions.by_status.past_due + s.subscriptions.by_status.grace > 0 ? "action" : "default", colors: "destructive", onClick: () => void setTab("subscricoes") },
              ]
            : []
        }
        skeletons={4}
      />

      {s && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <BarListPanel
            title="Ordens por estado"
            description="Todo o histórico de ordens"
            icon="ChartBar"
            items={Object.entries(s.orders.by_status).map(([k, v]) => ({ label: ORDER_STATUS[k]?.label ?? k, value: v }))}
          />
          <DonutPanel title="Subscrições por estado" description="Escolas por ciclo de vida" icon="ChartPie" centerLabel="subscrições" slices={slicesFromCounts(s.subscriptions.by_status, SUBSCRIPTION_STATUS)} />
          <BarListPanel
            className="md:col-span-2 xl:col-span-1"
            title="Receita: mês vs mês anterior"
            description={`${delta >= 0 ? "Subiu" : "Desceu"} ${kzShort(Math.abs(delta))}`}
            icon="TrendingUp"
            orientation="vertical"
            multicolor
            formatValue={kzShort}
            items={[{ label: "Mês anterior", value: Number(s.revenue.previous_month) }, { label: "Este mês", value: Number(s.revenue.month) }]}
          />
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => void setTab(v)}>
        <TabsList>
          <TabsTrigger value="fila">Fila de aprovação{s ? ` (${s.orders.waiting})` : ""}</TabsTrigger>
          <TabsTrigger value="ordens">Todas as ordens</TabsTrigger>
          <TabsTrigger value="subscricoes">Subscrições</TabsTrigger>
        </TabsList>
        <TabsContent value="fila" className="pt-4"><OrdersTable queue /></TabsContent>
        <TabsContent value="ordens" className="pt-4"><OrdersTable /></TabsContent>
        <TabsContent value="subscricoes" className="pt-4"><SubscriptionsTable /></TabsContent>
      </Tabs>

      <OrderReviewModal />
      <ProofViewer id={PROOF_MODAL} loadProof={subscriptionService.proof} />
      <SubscriptionStateModal />
    </div>
  );
}
