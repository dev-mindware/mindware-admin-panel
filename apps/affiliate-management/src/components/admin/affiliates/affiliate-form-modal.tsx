"use client";

import { GlobalModal } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { Affiliate } from "@workspace/types/affiliate";
import { AffiliateForm } from "./affiliate-form";

export function AffiliateFormModal() {
  const { modalData, closeModal } = useModalStore();
  const affiliate = modalData["edit-affiliate"] as Affiliate | undefined;

  return (
    <GlobalModal
      id="edit-affiliate"
      title={affiliate ? "Editar afiliado" : "Novo afiliado"}
      className="sm:max-w-[640px]"
    >
      <AffiliateForm affiliate={affiliate} onSuccess={() => closeModal("edit-affiliate")} />
    </GlobalModal>
  );
}
