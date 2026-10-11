"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ButtonOnlyAction, FilterToolbar, StatusBadge, ToneBadge, type Column } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useQueryState } from "nuqs";
import { useDebounce } from "use-debounce";
import { AdminTable } from "@/components/admin/shared/admin-table";
import { SUBSCRIPTION_STATUS } from "@/constants/statuses";
import { usePlans } from "@/hooks/commerce/use-catalog";
import { useSubscriptionsList } from "@/hooks/commerce/use-subscriptions";
import { day, kz } from "@/utils/format";
import type { AdminSubscription } from "@/types/api";

export const SUBSCRIPTION_STATE_MODAL = "subscription-state";

const STATUS_OPTIONS = Object.entries(SUBSCRIPTION_STATUS).map(([value, v]) => ({ value, label: v.label }));

/** Estado vivo da subscrição de cada escola: plano, estado, quanto falta e atalhos para a ficha e para suspender/reactivar. */
export function SubscriptionsTable() {
  const [q, setQ] = useQueryState("sq", { defaultValue: "" });
  const [status, setStatus] = useQueryState("sstatus", { defaultValue: "" });
  const [plan, setPlan] = useQueryState("splan", { defaultValue: "" });
  const [expiring, setExpiring] = useQueryState("sexp", { defaultValue: "" });
  const [dq] = useDebounce(q, 350);
  const plans = usePlans();
  const { openModal } = useModalStore();
  const router = useRouter();

  const list = useSubscriptionsList({
    ...(dq.length >= 2 ? { q: dq } : {}),
    ...(status ? { status } : {}),
    ...(plan ? { plan } : {}),
    ...(expiring ? { expiring_in_days: expiring } : {}),
  });

  const columns: Column<AdminSubscription>[] = [
    {
      key: "school",
      header: "Escola",
      render: (_, s) => (
        <Link href={`/schools/${s.school.id}`} className="block hover:underline">
          <p className="font-medium">{s.school.name}</p>
          <p className="text-xs text-muted-foreground">NIF {s.school.nif}</p>
        </Link>
      ),
    },
    {
      key: "plan",
      header: "Plano",
      render: (_, s) => (
        <div className="text-sm">
          <p>{s.plan.name}</p>
          <p className="text-xs text-muted-foreground">{kz(s.plan.monthly_price)}/mês{s.active_addons ? ` · ${s.active_addons} add-on` : ""}</p>
          {s.pending_plan && <p className="text-[11px] text-amber-600">Passa a {s.pending_plan.name} no próximo ciclo</p>}
        </div>
      ),
    },
    { key: "status", header: "Estado", render: (_, s) => <StatusBadge status={s.status} map={SUBSCRIPTION_STATUS} /> },
    {
      key: "period",
      header: "Termina",
      render: (_, s) => {
        const end = s.status === "trial" ? s.trial_ends_at : s.period_end;
        return (
          <div className="text-sm">
            <p>{day(end)}</p>
            {s.days_left !== null && <ToneBadge tone={s.days_left < 0 ? "danger" : s.days_left <= 7 ? "warning" : "neutral"} label={s.days_left < 0 ? `há ${-s.days_left} dia(s)` : `${s.days_left} dia(s)`} className="mt-0.5 text-[10px]" />}
            {s.cancel_at_period_end && <p className="text-[11px] text-destructive">Cancela no fim do período</p>}
          </div>
        );
      },
    },
    { key: "credit_balance", header: "Crédito", render: (_, s) => <span className="text-sm">{Number(s.credit_balance) > 0 ? kz(s.credit_balance) : "—"}</span> },
    {
      key: "actions",
      header: "Acção",
      render: (_, s) => (
        <ButtonOnlyAction
          data={s}
          actions={[
            { label: "Abrir ficha da escola", icon: "ExternalLink", onClick: (x) => router.push(`/schools/${x.school.id}`) },
            ...(["trial", "active", "past_due", "grace"].includes(s.status) ? [{ label: "Suspender subscrição", icon: "Pause" as const, variant: "destructive" as const, onClick: (x: AdminSubscription) => openModal(SUBSCRIPTION_STATE_MODAL, { school: x.school, action: "suspend" }) }] : []),
            ...(s.status === "suspended" ? [{ label: "Reactivar subscrição", icon: "Play" as const, onClick: (x: AdminSubscription) => openModal(SUBSCRIPTION_STATE_MODAL, { school: x.school, action: "reactivate" }) }] : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterToolbar
        search={{ value: q, onChange: (v) => void setQ(v), placeholder: "Pesquisar escola ou NIF…" }}
        filters={[
          { key: "status", label: "Estado", value: status, onChange: (v) => void setStatus(v), options: STATUS_OPTIONS },
          { key: "plan", label: "Plano", value: plan, onChange: (v) => void setPlan(v), options: (plans.data ?? []).map((p) => ({ value: p.code, label: p.name })) },
          { key: "exp", label: "A expirar", value: expiring, onChange: (v) => void setExpiring(v), options: [{ value: "7", label: "Em 7 dias" }, { value: "15", label: "Em 15 dias" }, { value: "30", label: "Em 30 dias" }] },
        ]}
        onClear={() => {
          void setQ("");
          void setStatus("");
          void setPlan("");
          void setExpiring("");
        }}
      />
      <AdminTable list={list} columns={columns} emptyTitle="Nenhuma subscrição encontrada" emptyDescription="Nenhuma escola corresponde aos filtros." emptyIcon="Wallet" />
    </div>
  );
}
