"use client";

import { useState } from "react";
import { Button, GlobalModal, Icon, Input, StatusBadge, Textarea, ToneBadge } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { ORDER_KIND, ORDER_STATUS } from "@/constants/statuses";
import { useOrder, useOrderActions, useOrderTimeline } from "@/hooks/commerce/use-subscriptions";
import { getApiErrorMessage } from "@/utils/api-error";
import { dateTime, kz } from "@/utils/format";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { OrderDetail } from "@/types/api";

export const ORDER_REVIEW_MODAL = "order-review";
export const PROOF_MODAL = "view-proof";

type Decision = "approved" | "replacement_required" | "rejected";

const DECISIONS: Array<{ value: Decision; label: string; hint: string; icon: "CircleCheck" | "FileWarning" | "CircleX" }> = [
  { value: "approved", label: "Aprovar", hint: "Confirma o pagamento e activa a subscrição.", icon: "CircleCheck" },
  { value: "replacement_required", label: "Pedir novo comprovativo", hint: "A escola é avisada e volta a enviar o ficheiro.", icon: "FileWarning" },
  { value: "rejected", label: "Rejeitar", hint: "Termina a ordem sem activar nada.", icon: "CircleX" },
];

const TIMELINE_LABEL: Record<string, string> = {
  OrderCreated: "Ordem criada",
  PaymentProofSubmitted: "Comprovativo enviado",
  ReviewStarted: "Revisão iniciada",
  ReviewReleased: "Revisão libertada",
  OrderApproved: "Ordem aprovada",
  OrderRejected: "Ordem rejeitada",
  OrderProofReplacementRequired: "Novo comprovativo pedido",
  OrderCancelled: "Ordem cancelada",
  "Review.approved": "Decisão: aprovada",
  "Review.rejected": "Decisão: rejeitada",
  "Review.replacement_required": "Decisão: novo comprovativo",
};

const fail = (e: unknown, fallback: string) => ErrorMessage(getApiErrorMessage(e, fallback));

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

/** Decisão sobre a ordem: aprovar (valor e referência), pedir novo comprovativo ou rejeitar. Montado de novo a cada ordem/estado, por isso nasce já preenchido. */
function DecisionForm({ o, onDone }: { o: OrderDetail; onDone: () => void }) {
  const actions = useOrderActions();
  const [decision, setDecision] = useState<Decision>("approved");
  const [amount, setAmount] = useState(o.total_amount);
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");

  const approvedOk = decision !== "approved" || (Number(amount) >= Number(o.total_amount) && reference.trim().length >= 3);
  const valid = reason.trim().length >= 5 && approvedOk;
  const submit = () =>
    actions.review.mutate(
      { id: o.id, body: { decision, reason: reason.trim(), ...(decision === "approved" ? { confirmed_amount: Number(amount).toFixed(2), reference: reference.trim() } : {}) } },
      {
        onSuccess: () => {
          SuccessMessage(decision === "approved" ? "Pagamento aprovado: subscrição activada." : decision === "rejected" ? "Ordem rejeitada." : "Novo comprovativo pedido à escola.");
          onDone();
        },
        onError: (e) => fail(e, "Não foi possível guardar a decisão."),
      },
    );

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-2 sm:grid-cols-3">
        {DECISIONS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setDecision(d.value)}
            className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left text-sm transition-colors ${decision === d.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
          >
            <span className="flex items-center gap-2 font-medium"><Icon name={d.icon} className="size-4" />{d.label}</span>
            <span className="text-xs text-muted-foreground">{d.hint}</span>
          </button>
        ))}
      </div>
      {decision === "approved" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={`Valor confirmado em Kz * (mínimo ${kz(o.total_amount)})`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Referência do pagamento *" placeholder="Ex.: TRF-20261011-001" value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>
      )}
      <Textarea label="Motivo * (mínimo 5 caracteres)" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={decision === "approved" ? "Ex.: Pagamento conferido no extracto." : "Ex.: Comprovativo ilegível, reenvie."} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => actions.release.mutate(o.id, { onSuccess: () => SuccessMessage("Ordem devolvida à fila."), onError: (e) => fail(e, "Não foi possível libertar a ordem.") })}
        >
          Libertar para outro revisor
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Pede a sua palavra-passe e fica na auditoria.</span>
          <Button variant={decision === "approved" ? "default" : decision === "rejected" ? "destructive" : "secondary"} disabled={!valid} loading={actions.review.isPending} onClick={submit}>
            {DECISIONS.find((d) => d.value === decision)?.label}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewDialog({ id }: { id: string }) {
  const { openModal, closeModal } = useModalStore();
  const order = useOrder(id);
  const timeline = useOrderTimeline(id);
  const actions = useOrderActions();
  const o = order.data;
  const reviewable = o ? ["payment_proof_submitted", "under_review"].includes(o.status) : false;
  const needsStart = o?.status === "payment_proof_submitted";

  return (
    <GlobalModal
      id={ORDER_REVIEW_MODAL}
      size="lg"
      title={<span className="flex items-center gap-2"><Icon name="ReceiptText" className="size-5 text-primary" />Revisão da ordem</span>}
      description={o ? `${o.school.name} · NIF ${o.school.nif}` : undefined}
      footer={<div className="flex justify-end"><Button variant="outline" onClick={() => closeModal(ORDER_REVIEW_MODAL)}>Fechar</Button></div>}
    >
      {order.isLoading || !o ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{order.isError ? "Não foi possível carregar a ordem." : "A carregar…"}</p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ordem</h4>
              <Row label="Estado"><StatusBadge status={o.status} map={ORDER_STATUS} /></Row>
              <Row label="Tipo">{ORDER_KIND[o.kind] ?? o.kind}</Row>
              <Row label="Plano">{o.plan.name}</Row>
              <Row label="Add-ons">{o.addon_codes.length ? o.addon_codes.join(", ") : "—"}</Row>
              <Row label="Período">{o.period_months} {o.period_months === 1 ? "mês" : "meses"}</Row>
              {Number(o.discount_amount) > 0 && <Row label="Desconto (cupão)"><ToneBadge tone="success" label={`− ${kz(o.discount_amount)}`} /></Row>}
              <Row label="Valor a pagar"><span className="text-base text-primary">{kz(o.total_amount)}</span></Row>
              <Row label="Criada">{dateTime(o.created_at)}</Row>
            </div>

            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comprovativo</h4>
              {o.proofs.filter((p) => p.is_current).map((p) => (
                <div key={p.id} className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="flex items-center gap-2 font-medium"><Icon name="FileText" className="size-4 text-primary" />{p.file_name}</p>
                  <p className="text-xs text-muted-foreground">{(p.size_bytes / 1024).toFixed(0)} KB · enviado {dateTime(p.uploaded_at)}</p>
                  <p className="break-all font-mono text-[10px] text-muted-foreground">SHA-256 {p.sha256.slice(0, 24)}…</p>
                  <Button size="sm" className="gap-2" onClick={() => openModal(PROOF_MODAL, o.id)}><Icon name="Eye" className="size-4" />Ver comprovativo</Button>
                </div>
              ))}
              {!o.proofs.some((p) => p.is_current) && <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">Esta ordem ainda não tem comprovativo.</p>}
              {o.reviewer_id && (
                <p className="mt-3 text-xs text-muted-foreground">Revisão iniciada {dateTime(o.review_started_at)}. {o.status === "under_review" && "Qualquer administrador pode libertar a ordem se ficar parada."}</p>
              )}
            </div>
          </div>

          {reviewable && needsStart && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Para decidir, pegue primeiro na revisão: assim mais ninguém decide esta ordem ao mesmo tempo.</p>
              <Button loading={actions.start.isPending} className="gap-2" onClick={() => actions.start.mutate(o.id, { onSuccess: () => SuccessMessage("Revisão iniciada: a ordem ficou consigo."), onError: (e) => fail(e, "Não foi possível iniciar a revisão.") })}>
                <Icon name="Play" className="size-4" />
                Iniciar revisão
              </Button>
            </div>
          )}
          {reviewable && !needsStart && <DecisionForm key={`${o.id}:${o.status}`} o={o} onDone={() => closeModal(ORDER_REVIEW_MODAL)} />}

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Histórico</h4>
            <ol className="space-y-2 border-l pl-4">
              {(timeline.data ?? []).map((e, i) => (
                <li key={`${e.at}-${i}`} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                  <p className="font-medium">{TIMELINE_LABEL[e.type] ?? e.type}{e.actor ? <span className="font-normal text-muted-foreground"> · {e.actor}</span> : null}</p>
                  <p className="text-xs text-muted-foreground">{dateTime(e.at)}{typeof e.detail?.reason === "string" ? ` · ${e.detail.reason}` : ""}</p>
                </li>
              ))}
              {timeline.data?.length === 0 && <li className="text-xs text-muted-foreground">Sem eventos.</li>}
            </ol>
          </div>
        </div>
      )}
    </GlobalModal>
  );
}

/** Revisão de uma ordem de subscrição (fluxo do MindGest: ver comprovativo → activar ou recusar). Abre com `openModal("order-review", orderId)`. */
export function OrderReviewModal() {
  const { open, modalData } = useModalStore();
  const id = modalData[ORDER_REVIEW_MODAL] as string | undefined;
  if (!open[ORDER_REVIEW_MODAL] || !id) return null;
  return <ReviewDialog key={id} id={id} />;
}
