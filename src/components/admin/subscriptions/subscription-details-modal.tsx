"use client";

import {
    GlobalModal,
    DetailRow,
    ItemStatusBadge,
    Icon,
    Button,
} from "@/components";
import { Subscription } from "@/types";
import { formatDateTime } from "@/utils";
import { useModal } from "@/stores/modal/use-modal-store";

export function SubscriptionDetailsModal() {
    const { modalData, closeModal } = useModal();
    const subscription = modalData["view-subscription-details"] as Subscription;

    if (!subscription) return null;

    const handleCloseModal = () => {
        closeModal("view-subscription-details");
    };

    return (
        <GlobalModal
            id="view-subscription-details"
            title="Detalhes da Subscrição"
            canClose
            className="w-max"
        >
            <div className="space-y-6 py-4">
                {/* General Info and Status */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Icon name="Info" className="size-4 text-primary" />
                            Informações Gerais
                        </h3>
                        <p className="text-sm text-muted-foreground">ID: {subscription.id}</p>
                    </div>
                    <ItemStatusBadge status={subscription.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Section */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2 text-primary">
                            <Icon name="Building" className="size-4" />
                            Empresa
                        </h4>
                        <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                            <DetailRow label="Nome" value={subscription.company.name} />
                            <DetailRow label="NIF" value={(subscription.company as any).taxNumber} />
                            <DetailRow label="Email" value={(subscription.company as any).email} />
                            <DetailRow label="Telefone" value={(subscription.company as any).phone} />
                        </div>
                    </div>

                    {/* Plan Section */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2 text-primary">
                            <Icon name="CreditCard" className="size-4" />
                            Plano
                        </h4>
                        <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                            <DetailRow label="Nome" value={subscription.plan.name} />
                            <DetailRow label="Preço" value={`$${subscription.plan.priceMonthly}/mês`} />
                            <DetailRow label="Utilizadores Máx." value={subscription.plan.maxUsers} />
                            <DetailRow label="Lojas Máx." value={subscription.plan.maxStores} />
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="space-y-3 pt-2">
                    <h4 className="font-medium text-sm flex items-center gap-2 text-primary">
                        <Icon name="Calendar" className="size-4" />
                        Datas e Prazos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 rounded-lg border bg-muted/30">
                        <DetailRow label="Criado em" value={formatDateTime(subscription.createdAt)} />
                        <DetailRow label="Início" value={formatDateTime(subscription.periodStartsAt)} />
                        <DetailRow label="Fim" value={formatDateTime(subscription.periodEndsAt)} />
                    </div>
                </div>
            </div>
                <div className="flex justify-end">
                    <Button variant="outline" onClick={handleCloseModal}>
                        Fechar
                    </Button>
                </div>
        </GlobalModal>
    );
}
