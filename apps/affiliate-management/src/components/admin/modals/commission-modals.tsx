"use client";

import { useState } from "react";
import { 
    GlobalModal, 
    Input, 
    Textarea, 
    Button,
    Field,
    FieldLabel,
    FieldContent,
    FieldError
} from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useApproveCommission, useRejectCommission, usePayCommission } from "@/hooks/affiliate";
import { toast } from "sonner";
import { Commission } from "@workspace/types/affiliate";

export function CommissionModals() {
    const { open, modalData, closeModal } = useModalStore();
    const { mutate: approve, isPending: isApproving } = useApproveCommission();
    const { mutate: reject, isPending: isRejecting } = useRejectCommission();
    const { mutate: pay, isPending: isPaying } = usePayCommission();

    const [file, setFile] = useState<File | null>(null);
    const [notas, setNotas] = useState("");

    const commission = 
        modalData["approve-commission"] as Commission || 
        modalData["reject-commission"] as Commission || 
        modalData["pay-commission"] as Commission;

    if (!commission) return null;

    const handleApprove = () => {
        approve(commission.id, {
            onSuccess: () => {
                toast.success("Comissão aprovada!");
                closeModal("approve-commission");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.detail || "Erro ao aprovar comissão.");
            }
        });
    };

    const handleReject = () => {
        if (!notas) {
            toast.error("Por favor, insira as notas de rejeição.");
            return;
        }

        reject({ id: commission.id, notas }, {
            onSuccess: () => {
                toast.success("Comissão rejeitada!");
                closeModal("reject-commission");
                setNotas("");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.detail || "Erro ao rejeitar comissão.");
            }
        });
    };

    const handlePay = () => {
        if (!file) {
            toast.error("Por favor, selecione o comprovativo.");
            return;
        }

        pay({ id: commission.id, comprovativo: file }, {
            onSuccess: () => {
                toast.success("Pagamento de comissão registrado!");
                closeModal("pay-commission");
                setFile(null);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.detail || "Erro ao registrar pagamento.");
            }
        });
    };

    return (
        <>
            <GlobalModal
                id="approve-commission"
                title="Aprovar Comissão"
                description={`Confirmar a aprovação da comissão de ${commission.valor_comissao} Kz?`}
            >
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => closeModal("approve-commission")}>Cancelar</Button>
                    <Button 
                        loading={isApproving} 
                        onClick={handleApprove}
                    >
                        Confirmar Aprovação
                    </Button>
                </div>
            </GlobalModal>

            <GlobalModal
                id="reject-commission"
                title="Rejeitar Comissão"
                description="Informe o motivo pelo qual esta comissão está sendo rejeitada."
            >
                <div className="space-y-6">
                    <Field>
                        <FieldLabel>Notas de Rejeição</FieldLabel>
                        <FieldContent>
                            <Textarea 
                                id="comm-reason" 
                                placeholder="Ex: Lead duplicado, venda cancelada..."
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </FieldContent>
                    </Field>
                    <div className="flex justify-end gap-3 pt-2 border-t">
                        <Button 
                            variant="destructive"
                            loading={isRejecting} 
                            onClick={handleReject}
                            className="w-full"
                        >
                            Rejeitar Comissão
                        </Button>
                    </div>
                </div>
            </GlobalModal>

            <GlobalModal
                id="pay-commission"
                title="Registrar Pagamento"
                description={`Anexe o comprovativo de pagamento de ${commission.valor_comissao} Kz.`}
            >
                <div className="space-y-6">
                    <Field>
                        <FieldLabel>Comprovativo</FieldLabel>
                        <FieldContent>
                            <Input 
                                id="comm-proof" 
                                type="file" 
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </FieldContent>
                    </Field>
                    <div className="flex justify-end gap-3 pt-2 border-t">
                        <Button 
                            loading={isPaying} 
                            onClick={handlePay}
                            className="w-full"
                        >
                            Confirmar Pagamento
                        </Button>
                    </div>
                </div>
            </GlobalModal>
        </>
    );
}
