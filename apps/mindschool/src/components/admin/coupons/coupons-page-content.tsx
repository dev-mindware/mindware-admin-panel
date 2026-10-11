"use client";

import { Badge, Button, ButtonOnlyAction, FilterToolbar, Icon, MetricGrid, ReasonModal, StackedBarPanel, StatusBadge, TitleList, type Column } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useQueryState } from "nuqs";
import { useDebounce } from "use-debounce";
import { AdminTable } from "@/components/admin/shared/admin-table";
import { PermissionGate } from "@/components/admin/shared/permission-gate";
import { COUPON_STATE } from "@/constants/statuses";
import { useCouponActions, useCouponStats, useCoupons } from "@/hooks/commerce/use-catalog";
import { getApiErrorMessage } from "@/utils/api-error";
import { dateTime, kz, kzShort } from "@/utils/format";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { AdminCoupon } from "@/types/api";
import { COUPON_FORM_MODAL, CouponFormModal } from "./coupon-form-modal";
import { COUPON_REDEMPTIONS_MODAL, CouponRedemptionsModal } from "./coupon-redemptions-modal";

const TOGGLE_MODAL = "coupon-toggle";
const STATE_OPTIONS = Object.entries(COUPON_STATE).filter(([k]) => k !== "exhausted").map(([value, v]) => ({ value, label: v.label }));

const discountText = (c: AdminCoupon) => (c.discount_type === "percentage" ? `${Number(c.discount_value)}%` : kz(c.discount_value));

/** Cupões de desconto: KPIs, lista com filtros, criação/edição, activar/desactivar e histórico de utilizações. */
export function CouponsPageContent() {
  const stats = useCouponStats();
  const [q, setQ] = useQueryState("cq", { defaultValue: "" });
  const [state, setState] = useQueryState("cstate", { defaultValue: "" });
  const [dq] = useDebounce(q, 350);
  const list = useCoupons({ ...(dq.length >= 2 ? { q: dq } : {}), ...(state ? { state } : {}) });
  const { openModal } = useModalStore();
  const { update } = useCouponActions();
  const s = stats.data;

  const columns: Column<AdminCoupon>[] = [
    {
      key: "code",
      header: "Cupão",
      render: (_, c) => (
        <div>
          <p className="font-mono text-sm font-semibold">{c.code}</p>
          {c.description && <p className="max-w-[220px] truncate text-xs text-muted-foreground">{c.description}</p>}
        </div>
      ),
    },
    { key: "discount", header: "Desconto", render: (_, c) => <Badge variant="success">{discountText(c)}</Badge> },
    {
      key: "rules",
      header: "Regras",
      render: (_, c) => (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <p>{c.applicable_plan ? `Plano ${c.applicable_plan.name}` : "Todos os planos"}{c.min_period_months ? ` · ≥ ${c.min_period_months} meses` : ""}</p>
          <p>{c.max_uses_per_school}× por escola</p>
        </div>
      ),
    },
    {
      key: "uses",
      header: "Utilizações",
      render: (_, c) => (
        <div className="text-sm">
          <p className="font-medium">{c.uses_count}{c.max_total_uses ? ` / ${c.max_total_uses}` : ""}</p>
          {c.max_total_uses ? <div className="mt-1 h-1.5 w-20 overflow-hidden rounded bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (c.uses_count / c.max_total_uses) * 100)}%` }} /></div> : null}
        </div>
      ),
    },
    {
      key: "validity",
      header: "Validade",
      render: (_, c) => <span className="text-xs text-muted-foreground">{c.starts_at ? `${dateTime(c.starts_at)} → ` : ""}{c.expires_at ? dateTime(c.expires_at) : "sem fim"}</span>,
    },
    { key: "state", header: "Estado", render: (_, c) => <StatusBadge status={c.state} map={COUPON_STATE} /> },
    {
      key: "actions",
      header: "Acção",
      render: (_, c) => (
        <ButtonOnlyAction
          data={c}
          actions={[
            { label: "Editar", icon: "Pencil", onClick: (x) => openModal(COUPON_FORM_MODAL, x) },
            { label: "Ver utilizações", icon: "History", onClick: (x) => openModal(COUPON_REDEMPTIONS_MODAL, x) },
            { label: c.is_active ? "Desactivar" : "Activar", icon: c.is_active ? "EyeOff" : "Eye", variant: c.is_active ? "destructive" : "default", onClick: (x) => openModal(TOGGLE_MODAL, x) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <TitleList title="Cupões" suTitle="Descontos para as subscrições das escolas. Só se gastam quando a ordem é aprovada.">
        <PermissionGate permission="platform:coupon_manage">
          <Button size="sm" className="gap-2" onClick={() => openModal(COUPON_FORM_MODAL, undefined)}>
            <Icon name="Plus" className="size-4" />
            Novo cupão
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
                { title: s.by_state.active, subtitle: "Cupões activos", description: `${s.total} no total`, icon: "Ticket", variant: "action" },
                { title: s.redemptions_month, subtitle: "Usados no mês", description: `${s.redemptions_total} desde sempre`, icon: "TicketCheck" },
                { title: kzShort(s.discount_month), subtitle: "Desconto no mês", description: `${kzShort(s.discount_total)} no total`, icon: "BadgePercent" },
              ]
            : []
        }
        skeletons={3}
      />

      {s && <StackedBarPanel title="Cupões por estado" description="Composição do catálogo de cupões" icon="Ticket" segments={Object.entries(s.by_state).map(([k, v]) => ({ key: k, label: COUPON_STATE[k]?.label ?? k, value: v }))} />}

      <div className="space-y-4">
        <FilterToolbar
          search={{ value: q, onChange: (v) => void setQ(v), placeholder: "Pesquisar código…" }}
          filters={[{ key: "state", label: "Estado", value: state, onChange: (v) => void setState(v), options: STATE_OPTIONS }]}
          onClear={() => { void setQ(""); void setState(""); }}
        />
        <AdminTable list={list} columns={columns} emptyTitle="Nenhum cupão" emptyDescription="Crie o primeiro cupão para oferecer descontos às escolas." emptyIcon="Ticket" />
      </div>

      <CouponFormModal />
      <CouponRedemptionsModal />
      <ReasonModal<AdminCoupon>
        id={TOGGLE_MODAL}
        title="Estado do cupão"
        description={(c) => (c ? `${c.is_active ? "Desactivar" : "Activar"} ${c.code}.` : undefined)}
        destructive
        onConfirm={async ({ reason }, c) => {
          if (!c) return;
          try {
            await update.mutateAsync({ id: c.id, body: { is_active: !c.is_active, reason } });
            SuccessMessage(c.is_active ? "Cupão desactivado." : "Cupão activado.");
          } catch (e) {
            ErrorMessage(getApiErrorMessage(e, "A operação falhou."));
            throw e;
          }
        }}
      />
    </div>
  );
}
