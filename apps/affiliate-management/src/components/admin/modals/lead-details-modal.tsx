"use client";

import { GlobalModal, Badge, Separator } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { Lead, LeadStatus } from "@workspace/types/affiliate";
import { formatDate } from "@workspace/utils";

export function LeadDetailsModal() {
    const { open, modalData, closeModal } = useModalStore();
    const lead = modalData["view-lead-details"] as Lead;

    if (!lead) return null;

    return (
        <GlobalModal
            id="view-lead-details"
            title="Detalhes do Lead"
            className="sm:max-w-[500px]"
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase">Cliente</p>
                        <p className="font-medium">{lead.client_nome}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase">Status</p>
                        <div className="mt-1">
                             <Badge variant={lead.status === LeadStatus.NEW ? "default" : "secondary"}>
                                {lead.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase">Telefone</p>
                        <p className="font-medium">{lead.client_telefone}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase">Criado em</p>
                        <p className="font-medium">{formatDate(lead.created_at)}</p>
                    </div>
                </div>

                <Separator />

                <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Notas / Observações</p>
                    <p className="text-sm bg-muted p-3 rounded-md min-h-[60px]">
                        {lead.notas || "Nenhuma nota registrada."}
                    </p>
                </div>
            </div>
        </GlobalModal>
    );
}
