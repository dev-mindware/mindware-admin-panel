"use client";

import { Badge, Button, ButtonOnlyAction, GenericTable, Icon, ListSkeleton, MetricGrid, ReasonModal, Tabs, TabsContent, TabsList, TabsTrigger, TitleList, ToneBadge, type Column } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { PermissionGate } from "@/components/admin/shared/permission-gate";
import { useAddons, useCatalogActions, usePlans } from "@/hooks/commerce/use-catalog";
import { useLocalPage } from "@/hooks/use-local-page";
import { useSubscriptionStats } from "@/hooks/commerce/use-subscriptions";
import { getApiErrorMessage } from "@/utils/api-error";
import { kz, kzShort } from "@/utils/format";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { AdminAddon, AdminPlan } from "@/types/api";
import { ADDON_FORM_MODAL, AddonFormModal } from "./addon-form-modal";
import { PLAN_FORM_MODAL, PlanFormModal } from "./plan-form-modal";

const TOGGLE_MODAL = "catalog-toggle";

interface ToggleTarget {
  kind: "plan" | "addon";
  id: string;
  name: string;
  active: boolean;
}

const limitText = (p: AdminPlan) =>
  Object.entries(p.limits)
    .slice(0, 3)
    .map(([k, v]) => `${v.limit === null ? "∞" : v.limit} ${v.unit ?? k}`)
    .join(" · ");

/** Catálogo comercial: planos e add-ons, com versão do catálogo, impacto (escolas por plano) e motivo em cada alteração. */
export function PlansPageContent() {
  const plans = usePlans();
  const addons = useAddons();
  const stats = useSubscriptionStats();
  const { updatePlan, updateAddon } = useCatalogActions();
  const { openModal } = useModalStore();
  const [tab, setTab] = useQueryState("tab", { defaultValue: "planos" });
  const planPage = useLocalPage(plans.data ?? []);
  const addonPage = useLocalPage(addons.data ?? []);

  const kpis = useMemo(() => {
    const s = stats.data;
    return [
      { title: (plans.data ?? []).filter((p) => p.is_active).length, subtitle: "Planos activos", description: `${(plans.data ?? []).length} no catálogo`, icon: "Package" as const },
      { title: s ? s.plans.reduce((a, p) => a + p.schools_paying, 0) : "—", subtitle: "Escolas a pagar", description: "Em planos activos, em atraso ou tolerância", icon: "School" as const },
      { title: s ? kzShort(s.mrr) : "—", subtitle: "MRR do catálogo", description: s ? `ARR ${kzShort(s.arr)}` : undefined, icon: "TrendingUp" as const },
      { title: (addons.data ?? []).filter((a) => a.is_active).length, subtitle: "Add-ons activos", description: `${(addons.data ?? []).reduce((a, x) => a + x.active_subscriptions, 0)} contratados`, icon: "Puzzle" as const },
    ];
  }, [plans.data, addons.data, stats.data]);

  const planColumns: Column<AdminPlan>[] = [
    { key: "rank", header: "#", render: (_, p) => <span className="font-mono text-xs text-muted-foreground">{p.rank}</span> },
    {
      key: "name",
      header: "Plano",
      render: (_, p) => (
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{p.code}</p>
        </div>
      ),
    },
    { key: "monthly_price", header: "Preço/mês", render: (_, p) => <span className="font-semibold text-primary">{kz(p.monthly_price)}</span> },
    { key: "features", header: "Funcionalidades", render: (_, p) => <Badge variant="secondary">{p.features.length} incluída(s)</Badge> },
    { key: "limits", header: "Limites", render: (_, p) => <span className="text-xs text-muted-foreground">{limitText(p) || "—"}</span> },
    { key: "subscriptions", header: "Escolas", render: (_, p) => <span className="text-sm">{p.subscriptions}</span> },
    { key: "catalog_version", header: "Versão", render: (_, p) => <span className="font-mono text-xs">v{p.catalog_version}</span> },
    { key: "is_active", header: "Estado", render: (_, p) => <ToneBadge tone={p.is_active ? "success" : "neutral"} label={p.is_active ? "Activo" : "Inactivo"} /> },
    {
      key: "actions",
      header: "Acção",
      render: (_, p) => (
        <ButtonOnlyAction
          data={p}
          actions={[
            { label: "Editar", icon: "Pencil", onClick: (x) => openModal(PLAN_FORM_MODAL, x) },
            { label: p.is_active ? "Desactivar" : "Activar", icon: p.is_active ? "EyeOff" : "Eye", variant: p.is_active ? "destructive" : "default", onClick: (x) => openModal(TOGGLE_MODAL, { kind: "plan", id: x.id, name: x.name, active: x.is_active } satisfies ToggleTarget) },
          ]}
        />
      ),
    },
  ];

  const addonColumns: Column<AdminAddon>[] = [
    {
      key: "name",
      header: "Add-on",
      render: (_, a) => (
        <div>
          <p className="font-medium">{a.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{a.code}</p>
        </div>
      ),
    },
    { key: "monthly_price", header: "Preço/mês", render: (_, a) => <span className="font-semibold text-primary">{kz(a.monthly_price)}</span> },
    {
      key: "grants",
      header: "Concede",
      render: (_, a) => (
        <span className="text-xs text-muted-foreground">
          {[...a.grants, ...Object.entries(a.limit_grants).map(([k, v]) => `+${v} ${k}`)].join(", ") || "—"}
        </span>
      ),
    },
    { key: "min_plan_rank", header: "Plano mínimo", render: (_, a) => <span className="text-sm">{a.min_plan_rank ? `≥ ${a.min_plan_rank}` : "Qualquer"}</span> },
    { key: "active_subscriptions", header: "Contratos", render: (_, a) => <span className="text-sm">{a.active_subscriptions}</span> },
    { key: "is_active", header: "Estado", render: (_, a) => <ToneBadge tone={a.is_active ? "success" : "neutral"} label={a.is_active ? "Activo" : "Inactivo"} /> },
    {
      key: "actions",
      header: "Acção",
      render: (_, a) => (
        <ButtonOnlyAction
          data={a}
          actions={[
            { label: "Editar", icon: "Pencil", onClick: (x) => openModal(ADDON_FORM_MODAL, x) },
            { label: a.is_active ? "Desactivar" : "Activar", icon: a.is_active ? "EyeOff" : "Eye", variant: a.is_active ? "destructive" : "default", onClick: (x) => openModal(TOGGLE_MODAL, { kind: "addon", id: x.id, name: x.name, active: x.is_active } satisfies ToggleTarget) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <TitleList title="Planos e extras" suTitle="O catálogo comercial. Cada alteração sobe a versão do catálogo e só afecta ordens novas.">
        <PermissionGate permission="platform:plan_manage">
          <Button size="sm" className="gap-2" onClick={() => openModal(tab === "extras" ? ADDON_FORM_MODAL : PLAN_FORM_MODAL, undefined)}>
            <Icon name="Plus" className="size-4" />
            {tab === "extras" ? "Novo add-on" : "Novo plano"}
          </Button>
        </PermissionGate>
      </TitleList>

      <MetricGrid items={kpis} isLoading={plans.isLoading && addons.isLoading} />

      <Tabs value={tab} onValueChange={(v) => void setTab(v)}>
        <TabsList>
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="extras">Extras (add-ons)</TabsTrigger>
        </TabsList>
        <TabsContent value="planos" className="pt-4">
          {plans.isLoading ? <ListSkeleton cols={6} rows={3} /> : (
            <GenericTable<AdminPlan> data={planPage.rows} columns={planColumns} page={planPage.page} total={planPage.total} totalPages={planPage.totalPages} setPage={planPage.setPage} goToNextPage={planPage.goToNextPage} goToPreviousPage={planPage.goToPreviousPage} emptyTitle="Sem planos" emptyDescription="O catálogo não tem planos." emptyIcon="Package" />
          )}
        </TabsContent>
        <TabsContent value="extras" className="pt-4">
          {addons.isLoading ? <ListSkeleton cols={6} rows={3} /> : (
            <GenericTable<AdminAddon> data={addonPage.rows} columns={addonColumns} page={addonPage.page} total={addonPage.total} totalPages={addonPage.totalPages} setPage={addonPage.setPage} goToNextPage={addonPage.goToNextPage} goToPreviousPage={addonPage.goToPreviousPage} emptyTitle="Sem add-ons" emptyDescription="O catálogo não tem add-ons." emptyIcon="Puzzle" />
          )}
        </TabsContent>
      </Tabs>

      <PlanFormModal />
      <AddonFormModal />
      <ReasonModal<ToggleTarget>
        id={TOGGLE_MODAL}
        title="Estado no catálogo"
        description={(t) => (t ? `${t.active ? "Desactivar" : "Activar"} «${t.name}»: ${t.active ? "deixa de poder ser comprado (as subscrições existentes mantêm-no)" : "volta a poder ser comprado"}.` : undefined)}
        destructive
        onConfirm={async ({ reason }, t) => {
          if (!t) return;
          try {
            if (t.kind === "plan") await updatePlan.mutateAsync({ id: t.id, body: { is_active: !t.active, reason } });
            else await updateAddon.mutateAsync({ id: t.id, body: { is_active: !t.active, reason } });
            SuccessMessage(t.active ? "Desactivado." : "Activado.");
          } catch (e) {
            ErrorMessage(getApiErrorMessage(e, "A operação falhou."));
            throw e;
          }
        }}
      />
    </div>
  );
}
