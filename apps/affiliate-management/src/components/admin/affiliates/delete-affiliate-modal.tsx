"use client";

import { Button, GlobalModal } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { Affiliate } from "@workspace/types/affiliate";
import { useDeleteAffiliate } from "@/hooks/affiliate";
import { toast } from "sonner";

export function DeleteAffiliateModal() {
  const { modalData, closeModal } = useModalStore();
  const affiliate = modalData["delete-affiliate"] as Affiliate | undefined;
  const { mutate: deleteAffiliate, isPending } = useDeleteAffiliate();

  if (!affiliate) return null;

  const currentAffiliate = affiliate;

  function handleDelete() {
    deleteAffiliate(currentAffiliate.id, {
      onSuccess: () => {
        toast.success("Afiliado eliminado com sucesso.");
        closeModal("delete-affiliate");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Não foi possível eliminar o afiliado.");
      },
    });
  }

  return (
    <GlobalModal
      id="delete-affiliate"
      title="Eliminar afiliado"
      description="Esta ação só é permitida para afiliados sem histórico associado."
      type="warning"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tem certeza de que deseja eliminar <strong className="text-foreground">{currentAffiliate.nome_completo}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => closeModal("delete-affiliate")}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "A eliminar..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
