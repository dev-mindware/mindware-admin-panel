"use client";

import { Badge, Button, GlobalModal, Separator } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { Affiliate, AffiliateStatus } from "@workspace/types/affiliate";
import { formatDate } from "@workspace/utils";
import { useUpdateAffiliateStatus } from "@/hooks/affiliate";
import { toast } from "sonner";

export function AffiliateDetailsModal() {
  const { modalData, closeModal } = useModalStore();
  const { mutate: updateStatus, isPending } = useUpdateAffiliateStatus();
  const affiliate = modalData["view-affiliate-details"] as Affiliate | undefined;

  if (!affiliate) return null;

  const handleAction = (status: AffiliateStatus) => {
    updateStatus(
      { id: affiliate.id, status },
      {
        onSuccess: () => {
          toast.success(`Estado atualizado para ${status}.`);
          closeModal("view-affiliate-details");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.detail || "Erro ao atualizar o estado.");
        },
      },
    );
  };

  return (
    <GlobalModal id="view-affiliate-details" title="Detalhes do afiliado" className="sm:max-w-[550px]">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{affiliate.nome_completo}</h3>
            <p className="text-sm text-muted-foreground">{affiliate.email}</p>
          </div>
          <Badge variant={affiliate.status === AffiliateStatus.ACTIVE ? "success" : "pending"}>
            {affiliate.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-y-4 text-sm">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Código de afiliado</p>
            <p className="font-mono font-medium">{affiliate.codigo_afiliado}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Membro desde</p>
            <p className="font-medium">{formatDate(affiliate.created_at)}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-semibold">Ações administrativas</p>
          <div className="flex flex-wrap gap-2">
            {affiliate.status === AffiliateStatus.PENDING_APPROVAL && (
              <>
                <Button loading={isPending} onClick={() => handleAction(AffiliateStatus.ACTIVE)}>
                  Aprovar afiliado
                </Button>
                <Button variant="destructive" loading={isPending} onClick={() => handleAction(AffiliateStatus.REJECTED)}>
                  Rejeitar
                </Button>
              </>
            )}
            {affiliate.status === AffiliateStatus.ACTIVE && (
              <Button variant="outline" loading={isPending} onClick={() => handleAction(AffiliateStatus.SUSPENDED)}>
                Suspender conta
              </Button>
            )}
            {affiliate.status === AffiliateStatus.SUSPENDED && (
              <Button loading={isPending} onClick={() => handleAction(AffiliateStatus.ACTIVE)}>
                Reativar conta
              </Button>
            )}
          </div>
        </div>
      </div>
    </GlobalModal>
  );
}
