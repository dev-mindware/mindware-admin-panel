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
import { useApproveWithdrawal, useRejectWithdrawal } from "@/hooks/affiliate";
import { toast } from "sonner";
import { WithdrawalRequest } from "@workspace/types/affiliate";

export function WithdrawalModals() {
    const { open, modalData, closeModal } = useModalStore();
    const { mutate: approve, isPending: isApproving } = useApproveWithdrawal();
    const { mutate: reject, isPending: isRejecting } = useRejectWithdrawal();

    const [file, setFile] = useState<File | null>(null);
    const [notas, setNotas] = useState("");

    const withdrawal = modalData["approve-withdrawal"] as WithdrawalRequest || modalData["reject-withdrawal"] as WithdrawalRequest;

    if (!withdrawal) return null;

    const handleApprove = () => {
        if (!file) {
            toast.error("Por favor, selecione o comprovativo.");
            return;
        }

        approve({ id: withdrawal.id, file }, {
            onSuccess: () => {
                toast.success("Pagamento aprovado com sucesso!");
                closeModal("approve-withdrawal");
                setFile(null);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.detail || "Erro ao aprovar pagamento.");
            }
        });
    };

    const handleReject = () => {
        if (!notas) {
            toast.error("Por favor, insira o motivo da rejeição.");
            return;
        }

        reject({ id: withdrawal.id, notas }, {
            onSuccess: () => {
                toast.success("Pedido rejeitado com sucesso!");
                closeModal("reject-withdrawal");
                setNotas("");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.detail || "Erro ao rejeitar pedido.");
            }
        });
    };

    return (
        <>
            <GlobalModal
                id="approve-withdrawal"
                title="Aprovar Pagamento"
                description={`Você está aprovando o pagamento de ${withdrawal.valor} Kz para ${withdrawal.affiliate_nome}.`}
            >
                <div className="space-y-6">
                    <Field>
                        <FieldLabel>Comprovativo de Transferência</FieldLabel>
                        <FieldContent>
                            <Input 
                                id="proof" 
                                type="file" 
                                accept="image/*,application/pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </FieldContent>
                    </Field>
                    <div className="flex justify-end gap-3 pt-2 border-t">
                        <Button 
                            loading={isApproving} 
                            onClick={handleApprove}
                            className="w-full"
                        >
                            Confirmar Pagamento
                        </Button>
                    </div>
                </div>
            </GlobalModal>

            <GlobalModal
                id="reject-withdrawal"
                title="Rejeitar Pedido de Saque"
                description={`Por favor, informe o motivo da rejeição para ${withdrawal.affiliate_nome}.`}
            >
                <div className="space-y-6">
                    <Field>
                        <FieldLabel>Motivo da Rejeição</FieldLabel>
                        <FieldContent>
                            <Textarea 
                                id="reason" 
                                placeholder="Descreva o motivo..."
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
                            Rejeitar Pedido
                        </Button>
                    </div>
                </div>
            </GlobalModal>
        </>
    );
}
