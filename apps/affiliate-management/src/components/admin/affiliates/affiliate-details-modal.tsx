"use client";

import {
    GlobalModal,
    DetailRow,
    ItemStatusBadge,
    Icon,
    Button,
} from "@workspace/ui";
import { Affiliate } from "@workspace/types/affiliate";
import { formatDate, formatCurrency } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";

export function AffiliateDetailsModal() {
    const { modalData, closeModal } = useModalStore();
    const affiliate = modalData["view-affiliate-details"] as Affiliate;

    if (!affiliate) return null;

    const handleCloseModal = () => {
        closeModal("view-affiliate-details");
    };

    return (
        <GlobalModal
            id="view-affiliate-details"
            title="Detalhes do Afiliado"
            className="sm:max-w-[600px]"
        >
            <div className="space-y-6 py-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Icon name="User" className="size-4 text-primary" />
                            {affiliate.nome_completo}
                        </h3>
                        <p className="text-sm text-muted-foreground">ID: {affiliate.id}</p>
                    </div>
                    <ItemStatusBadge status={affiliate.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2 text-primary">
                            <Icon name="Contact" className="size-4" />
                            Contato
                        </h4>
                        <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                            <DetailRow label="Email" value={affiliate.email} />
                            <DetailRow label="Telefone" value={affiliate.telefone} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2 text-primary">
                            <Icon name="Building" className="size-4" />
                            Dados Bancários
                        </h4>
                        <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                            <DetailRow label="Banco" value={affiliate.banco} />
                            <DetailRow label="Conta/IBAN" value={affiliate.conta_bancaria} />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <h4 className="font-medium text-sm flex items-center gap-2 text-primary">
                        <Icon name="TrendingUp" className="size-4" />
                        Performance Financeira
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 rounded-lg border bg-muted/30">
                        <DetailRow label="Ganhos Totais" value={formatCurrency(affiliate.total_earned)} />
                        <DetailRow label="Total Pago" value={formatCurrency(affiliate.total_paid)} />
                        <DetailRow label="Saldo" value={formatCurrency(affiliate.total_earned - affiliate.total_paid)} />
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <h4 className="font-medium text-sm flex items-center gap-2 text-primary">
                        <Icon name="Calendar" className="size-4" />
                        Datas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg border bg-muted/30">
                        <DetailRow label="Criado em" value={formatDate(affiliate.created_at)} />
                        <DetailRow label="Aprovado em" value={affiliate.approved_at ? formatDate(affiliate.approved_at) : "Pendente"} />
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={handleCloseModal}>
                    Fechar
                </Button>
            </div>
        </GlobalModal>
    );
}
