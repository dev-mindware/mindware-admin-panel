"use client";

import { useModal } from "@/stores/modal/use-modal-store";
import {
    Icon,
    Button,
    GlobalModal,
} from "@/components";

export function ProofViewerModal() {
    const { closeModal, open, modalData } = useModal();
    const proofUrl = modalData["view-proof"];

    if (!open["view-proof"]) return null;

    const isPDF = typeof proofUrl === "string" && proofUrl.toLowerCase().endsWith(".pdf");

    return (
        <GlobalModal
            canClose
            id="view-proof"
            title={
                <div className="flex items-center gap-2">
                    <Icon name="FileText" className="w-5 h-5 text-primary" />
                    <span>Comprovativo de Pagamento</span>
                </div>
            }
            className="w-full max-w-4xl max-h-[90vh]"
            footer={
                <div className="flex justify-end gap-2">
                    {proofUrl && (
                        <Button
                            variant="outline"
                            onClick={() => window.open(proofUrl, "_blank")}
                        >
                            <Icon name="ExternalLink" className="w-4 h-4 mr-2" />
                            Abrir em nova aba
                        </Button>
                    )}
                    <Button variant="default" onClick={() => closeModal("view-proof")}>
                        Fechar
                    </Button>
                </div>
            }
        >
            <div className="mt-4 flex flex-col items-center justify-center overflow-hidden rounded-lg border bg-muted/50 min-h-[300px]">
                {proofUrl ? (
                    isPDF ? (
                        <iframe
                            src={proofUrl}
                            className="w-full h-[60vh]"
                            title="Comprovativo PDF"
                        />
                    ) : (
                        <div className="relative w-full overflow-auto max-h-[70vh] flex justify-center p-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={proofUrl}
                                alt="Comprovativo de Pagamento"
                                className="max-w-full h-auto object-contain shadow-md"
                            />
                        </div>
                    )
                ) : (
                    <div className="text-center p-12 space-y-4">
                        <div className="mx-auto rounded-full w-16 h-16 bg-muted flex items-center justify-center">
                            <Icon name="FileWarning" className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">Nenhum ficheiro encontrado ou URL inválido.</p>
                    </div>
                )}
            </div>
        </GlobalModal>
    );
}
