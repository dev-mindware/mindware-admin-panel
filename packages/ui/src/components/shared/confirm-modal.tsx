"use client";

import { useState } from "react";
import { useModalStore } from "@workspace/hooks";
import { GlobalModal } from "../modal";
import { Button } from "../ui/button";

interface ConfirmModalProps<T = unknown> {
  id: string;
  title: string;
  /** Recebe o item guardado em `openModal(id, item)`. */
  description?: string | ((item: T | undefined) => string | undefined);
  confirmLabel?: string;
  destructive?: boolean;
  /** Se rejeitar, o modal fica aberto. */
  onConfirm: (item: T | undefined) => Promise<unknown> | unknown;
}

/** Confirmação simples (sem motivo) de uma acção reversível ou de baixo risco. Para acções sensíveis use `ReasonModal`. */
export function ConfirmModal<T = unknown>({ id, title, description, confirmLabel = "Confirmar", destructive, onConfirm }: ConfirmModalProps<T>) {
  const { open, modalData, closeModal } = useModalStore();
  const [busy, setBusy] = useState(false);
  if (!open[id]) return null;
  const item = modalData[id] as T | undefined;

  const submit = async () => {
    setBusy(true);
    try {
      await onConfirm(item);
      closeModal(id);
    } catch {
      /* o erro já é mostrado por quem chama */
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlobalModal
      id={id}
      title={title}
      description={typeof description === "function" ? description(item) : description}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => closeModal(id)}>
            Cancelar
          </Button>
          <Button type="button" variant={destructive ? "destructive" : "default"} loading={busy} onClick={submit}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <span className="sr-only">{title}</span>
    </GlobalModal>
  );
}
