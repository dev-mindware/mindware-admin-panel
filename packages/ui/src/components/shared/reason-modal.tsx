"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useModalStore } from "@workspace/hooks";
import { GlobalModal } from "../modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface ReasonModalProps<T = unknown> {
  id: string;
  title: ReactNode | ((item: T | undefined) => ReactNode);
  /** Recebe o item guardado em `openModal(id, item)`. */
  description?: string | ((item: T | undefined) => string | undefined);
  confirmLabel?: string;
  destructive?: boolean;
  /** Mínimo de caracteres do motivo (a API exige 10 nas acções administrativas). */
  minLength?: number;
  /** Pede também a referência do pedido de suporte. */
  withTicket?: boolean;
  /** Campos extra acima do motivo (selecções, opções…). */
  children?: (item: T | undefined) => ReactNode;
  /** Chamado com o motivo (e a referência, se pedida). Se rejeitar, o modal fica aberto. */
  onConfirm: (input: { reason: string; ticket?: string }, item: T | undefined) => Promise<unknown> | unknown;
}

/**
 * Modal único das acções sensíveis do painel: motivo obrigatório (+ referência opcional), botão desactivado até o motivo ser válido
 * e a acção só fecha o modal se tiver sucesso. A reautenticação (step-up) é pedida pelo cliente HTTP quando a API a exige.
 */
export function ReasonModal<T = unknown>({
  id, title, description, confirmLabel = "Confirmar", destructive, minLength = 10, withTicket, children, onConfirm,
}: ReasonModalProps<T>) {
  const { open, modalData, closeModal } = useModalStore();
  const isOpen = !!open[id];
  const item = modalData[id] as T | undefined;
  const [reason, setReason] = useState("");
  const [ticket, setTicket] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setTicket("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const valid = reason.trim().length >= minLength;
  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await onConfirm({ reason: reason.trim(), ...(withTicket && ticket.trim() ? { ticket: ticket.trim() } : {}) }, item);
      closeModal(id);
    } catch {
      /* o erro já é mostrado por quem chama; o modal fica aberto para corrigir */
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlobalModal
      id={id}
      title={typeof title === "function" ? title(item) : title}
      description={typeof description === "function" ? description(item) : description}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => closeModal(id)}>
            Cancelar
          </Button>
          <Button type="button" variant={destructive ? "destructive" : "default"} disabled={!valid} loading={busy} onClick={submit}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {children?.(item)}
        <Textarea
          label={`Motivo * (mínimo ${minLength} caracteres)`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Ex.: Pedido do Titular por telefone, confirmado por email."
        />
        {withTicket && <Input label="Referência do pedido de suporte (opcional)" value={ticket} onChange={(e) => setTicket(e.target.value)} />}
        <p className="text-[11px] text-muted-foreground">O motivo fica registado na auditoria com o seu nome.</p>
      </div>
    </GlobalModal>
  );
}
