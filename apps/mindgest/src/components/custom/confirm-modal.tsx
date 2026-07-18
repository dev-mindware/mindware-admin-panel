"use client";

import { useState } from "react";
import { GlobalModal, Button } from "@workspace/ui";
import { useModal } from "@/stores/modal/use-modal-store";

export const CONFIRM_MODAL_ID = "confirm";

export interface ConfirmModalData {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
}

export function openConfirmModal(
  openModal: (id: string, data?: unknown) => void,
  data: ConfirmModalData,
) {
  openModal(CONFIRM_MODAL_ID, data);
}

export function ConfirmModal() {
  const { open, modalData, closeModal } = useModal();
  const [isPending, setIsPending] = useState(false);

  const isOpen = open[CONFIRM_MODAL_ID] || false;
  const data = modalData[CONFIRM_MODAL_ID] as ConfirmModalData | undefined;

  if (!isOpen || !data) return null;

  const {
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    loadingLabel = "A processar...",
    destructive = false,
    onConfirm,
  } = data;

  const handleConfirm = async () => {
    try {
      setIsPending(true);
      await onConfirm();
      closeModal(CONFIRM_MODAL_ID);
    } catch {
      // Keep the modal open so the user can retry; the caller surfaces the error.
    } finally {
      setIsPending(false);
    }
  };

  return (
    <GlobalModal
      id={CONFIRM_MODAL_ID}
      type="warning"
      title={title}
      description={description}
      footer={
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => closeModal(CONFIRM_MODAL_ID)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? loadingLabel : confirmLabel}
          </Button>
        </div>
      }
    >
      {null}
    </GlobalModal>
  );
}
