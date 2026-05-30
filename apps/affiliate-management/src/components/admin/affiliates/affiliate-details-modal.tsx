"use client";

import { Button, DetailRow, GlobalModal, Icon, ItemStatusBadge } from "@workspace/ui";
import { Affiliate } from "@workspace/types/affiliate";
import { formatCurrency, formatDate } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";

export function AffiliateDetailsModal() {
  const { modalData, closeModal } = useModalStore();
  const affiliate = modalData["view-affiliate-details"] as Affiliate | undefined;

  if (!affiliate) return null;

  return (
    <GlobalModal id="view-affiliate-details" title="Detalhes do afiliado" className="sm:max-w-[600px]">
      <div className="space-y-6 py-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Icon name="User" className="size-4 text-primary" />
              {affiliate.nome_completo}
            </h3>
            <p className="text-sm text-muted-foreground">ID: {affiliate.id}</p>
          </div>
          <ItemStatusBadge status={affiliate.status} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Contact" className="size-4" />
              Contacto
            </h4>
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <DetailRow label="Email" value={affiliate.email} />
              <DetailRow label="Telefone" value={affiliate.telefone || "Sem telefone"} />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Building" className="size-4" />
              Dados bancários
            </h4>
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <DetailRow label="Banco" value={affiliate.banco || "Sem banco"} />
              <DetailRow label="Conta/IBAN" value={affiliate.conta_bancaria || "Sem conta"} />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
            <Icon name="TrendingUp" className="size-4" />
            Performance financeira
          </h4>
          <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-3 md:grid-cols-3">
            <DetailRow label="Ganhos totais" value={formatCurrency(affiliate.total_earned)} />
            <DetailRow label="Total pago" value={formatCurrency(affiliate.total_paid)} />
            <DetailRow label="Saldo" value={formatCurrency(affiliate.total_earned - affiliate.total_paid)} />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
            <Icon name="Calendar" className="size-4" />
            Datas
          </h4>
          <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-3 md:grid-cols-2">
            <DetailRow label="Criado em" value={formatDate(affiliate.created_at)} />
            <DetailRow label="Aprovado em" value={affiliate.approved_at ? formatDate(affiliate.approved_at) : "Pendente"} />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={() => closeModal("view-affiliate-details")}>
          Fechar
        </Button>
      </div>
    </GlobalModal>
  );
}
