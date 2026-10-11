"use client";

import { Badge, ButtonOnlyAction, FilterToolbar, StatusBadge, ToneBadge, type Column } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useQueryState } from "nuqs";
import { useDebounce } from "use-debounce";
import { AdminTable } from "@/components/admin/shared/admin-table";
import { ORDER_KIND, ORDER_STATUS } from "@/constants/statuses";
import { useOrderActions, useOrders } from "@/hooks/commerce/use-subscriptions";
import { getApiErrorMessage } from "@/utils/api-error";
import { dateTime, kz, since } from "@/utils/format";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { AdminOrder } from "@/types/api";
import { ORDER_REVIEW_MODAL, PROOF_MODAL } from "./order-review-modal";

const STATUS_OPTIONS = Object.entries(ORDER_STATUS).map(([value, v]) => ({ value, label: v.label }));
const KIND_OPTIONS = Object.entries(ORDER_KIND).map(([value, label]) => ({ value, label }));

/** Nível de urgência de uma ordem em fila: >24 h é vermelho, >8 h âmbar. */
const waitingTone = (h: number | null) => (h === null ? "neutral" : h >= 24 ? "danger" : h >= 8 ? "warning" : "neutral");

/**
 * Lista de ordens de subscrição. `queue` mostra só o que espera revisão (por rever + em revisão), mais antigas primeiro em cima;
 * senão é o histórico completo com todos os filtros.
 */
export function OrdersTable({ queue = false }: { queue?: boolean }) {
  const ns = queue ? "f" : "o";
  const [q, setQ] = useQueryState(`${ns}q`, { defaultValue: "" });
  const [status, setStatus] = useQueryState(`${ns}status`, { defaultValue: "" });
  const [kind, setKind] = useQueryState(`${ns}kind`, { defaultValue: "" });
  const [coupon, setCoupon] = useQueryState(`${ns}coupon`, { defaultValue: "" });
  const [dq] = useDebounce(q, 350);

  const list = useOrders({
    ...(dq.length >= 2 ? { q: dq } : {}),
    ...(queue ? { open: "true" } : status ? { status } : {}),
    ...(kind ? { kind } : {}),
    ...(coupon ? { has_coupon: coupon } : {}),
  });
  const { openModal } = useModalStore();
  const { start, release } = useOrderActions();
  const fail = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."));

  const rows = queue ? [...list.rows].sort((a, b) => (b.waiting_hours ?? 0) - (a.waiting_hours ?? 0)) : list.rows;

  const columns: Column<AdminOrder>[] = [
    {
      key: "school",
      header: "Escola",
      render: (_, o) => (
        <div>
          <p className="font-medium">{o.school.name}</p>
          <p className="text-xs text-muted-foreground">NIF {o.school.nif}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plano",
      render: (_, o) => (
        <div className="space-y-0.5">
          <p className="text-sm">{o.plan.name}</p>
          <p className="text-xs text-muted-foreground">{ORDER_KIND[o.kind] ?? o.kind} · {o.period_months} {o.period_months === 1 ? "mês" : "meses"}{o.addon_codes.length ? ` · +${o.addon_codes.length} add-on` : ""}</p>
        </div>
      ),
    },
    {
      key: "total_amount",
      header: "Valor",
      render: (_, o) => (
        <div className="text-sm">
          <p className="font-semibold text-primary">{kz(o.total_amount)}</p>
          {o.coupon_code && <Badge variant="success" className="mt-0.5 text-[10px]">{o.coupon_code} · −{kz(o.discount_amount)}</Badge>}
        </div>
      ),
    },
    { key: "status", header: "Estado", render: (_, o) => <StatusBadge status={o.status} map={ORDER_STATUS} /> },
    {
      key: "waiting",
      header: queue ? "Na fila" : "Criada",
      render: (_, o) =>
        o.waiting_hours !== null ? <ToneBadge tone={waitingTone(o.waiting_hours)} label={since(o.proof_uploaded_at ?? o.created_at)} /> : <span className="text-xs text-muted-foreground">{dateTime(o.created_at)}</span>,
    },
    {
      key: "reviewer",
      header: "Revisor",
      render: (_, o) => (o.reviewer ? <span className="text-xs">{o.reviewer.full_name ?? "—"}</span> : <span className="text-xs text-muted-foreground">—</span>),
    },
    {
      key: "actions",
      header: "Acção",
      render: (_, o) => {
        const open = ["payment_proof_submitted", "under_review"].includes(o.status);
        return (
          <ButtonOnlyAction
            data={o}
            actions={[
              { label: open ? "Rever" : "Ver detalhe", icon: open ? "ClipboardCheck" : "Eye", onClick: (x) => openModal(ORDER_REVIEW_MODAL, x.id) },
              ...(o.has_proof ? [{ label: "Ver comprovativo", icon: "FileText" as const, onClick: (x: AdminOrder) => openModal(PROOF_MODAL, x.id) }] : []),
              ...(o.status === "payment_proof_submitted"
                ? [{ label: "Iniciar revisão", icon: "Play" as const, onClick: (x: AdminOrder) => start.mutate(x.id, { onSuccess: () => SuccessMessage("Revisão iniciada."), onError: fail }) }]
                : []),
              ...(o.status === "under_review"
                ? [{ label: "Libertar revisão", icon: "Undo2" as const, onClick: (x: AdminOrder) => release.mutate(x.id, { onSuccess: () => SuccessMessage("Ordem devolvida à fila."), onError: fail }) }]
                : []),
            ]}
          />
        );
      },
    },
  ];

  const clear = () => {
    void setQ("");
    void setStatus("");
    void setKind("");
    void setCoupon("");
  };

  return (
    <div className="space-y-4">
      <FilterToolbar
        search={{ value: q, onChange: (v) => void setQ(v), placeholder: "Pesquisar escola ou NIF…" }}
        filters={[
          ...(queue ? [] : [{ key: "status", label: "Estado", value: status, onChange: (v: string) => void setStatus(v), options: STATUS_OPTIONS }]),
          { key: "kind", label: "Tipo", value: kind, onChange: (v: string) => void setKind(v), options: KIND_OPTIONS },
          { key: "coupon", label: "Cupão", value: coupon, onChange: (v: string) => void setCoupon(v), options: [{ value: "true", label: "Com cupão" }, { value: "false", label: "Sem cupão" }] },
        ]}
        onClear={clear}
      />
      <AdminTable
        list={{ ...list, rows }}
        columns={columns}
        emptyTitle={queue ? "Fila vazia" : "Nenhuma ordem encontrada"}
        emptyDescription={queue ? "Não há comprovativos à espera de revisão." : "Nenhuma ordem corresponde aos filtros."}
        emptyIcon={queue ? "CircleCheck" : "ReceiptText"}
      />
    </div>
  );
}
