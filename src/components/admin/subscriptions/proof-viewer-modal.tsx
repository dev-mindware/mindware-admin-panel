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

    const getEmbedUrl = (url: string) => {
        if (!url) return "";

        // Handle Google Drive links
        if (url.includes("drive.google.com")) {
            let fileId = "";

            // Extract ID from /file/d/ID/...
            const match = url.match(/\/file\/d\/([^/?]+)/);
            if (match && match[1]) {
                fileId = match[1];
            }
            // Extract ID from ?id=ID
            else if (url.includes("?id=")) {
                fileId = new URL(url).searchParams.get("id") || "";
            }

            if (fileId) {
                // Using /preview is better for authenticated sessions although still sensitive to 3rd party cookie blocking
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
        }
        return url;
    };

    const embedUrl = getEmbedUrl(proofUrl);
    const isDrive = typeof proofUrl === "string" && proofUrl.includes("drive.google.com");
    const isPDF = isDrive || (typeof proofUrl === "string" && proofUrl.toLowerCase().endsWith(".pdf"));

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
            className="w-full max-w-5xl h-[95vh]"
            footer={
                <div className="flex justify-end gap-2">
                    {proofUrl && (
                        <Button
                            variant="default"
                            onClick={() => window.open(proofUrl, "_blank")}
                        >
                            <Icon name="ExternalLink" className="w-4 h-4 mr-2" />
                            Abrir no Google Drive
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => closeModal("view-proof")}>
                        Fechar
                    </Button>
                </div>
            }
        >
            <div className="mt-4 flex flex-col items-center justify-center overflow-hidden rounded-lg border bg-muted/50 min-h-[300px]">
                {proofUrl ? (
                    <div className="w-full h-full flex flex-col">
                        {isDrive && (
                            <div className="bg-primary/5 border-b border-primary/10 p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Icon name="Lightbulb" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-primary/90">
                                            Como ver o ficheiro sem sair do painel?
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            O seu navegador está a proteger a sua privacidade e bloqueou o login do Google Drive dentro do modal.
                                            Para usar o seu login atual aqui:
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 items-center bg-background/50 p-3 rounded-md border border-primary/20">
                                    <div className="flex items-center gap-2 text-[11px] font-medium text-foreground/80">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">1</span>
                                        Clique no ícone de <span className="px-1.5 py-0.5 bg-muted rounded border inline-flex items-center font-bold text-primary"><Icon name="EyeOff" className="w-3 h-3 mr-1" /> Olho</span> ou <span className="px-1.5 py-0.5 bg-muted rounded border inline-flex items-center font-bold text-primary"><Icon name="Shield" className="w-3 h-3 mr-1" /> Escudo</span> na barra de endereços.
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-medium text-foreground/80">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">2</span>
                                        Selecione <strong>"Permitir cookies"</strong> ou <strong>"Desativar proteção"</strong> para este site.
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex-1 min-h-[70vh]">
                            {isPDF ? (
                                isDrive ? (
                                    <iframe
                                        src={embedUrl}
                                        className="w-full h-[75vh]"
                                        title="Comprovativo Google Drive"
                                        allow="autoplay"
                                    />
                                ) : (
                                    <object
                                        data={embedUrl}
                                        type="application/pdf"
                                        className="w-full h-[75vh]"
                                    >
                                        <iframe
                                            src={embedUrl}
                                            className="w-full h-full"
                                            title="Comprovativo PDF Fallback"
                                        />
                                    </object>
                                )
                            ) : (
                                <div className="relative w-full overflow-auto max-h-[75vh] flex justify-center p-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={proofUrl}
                                        alt="Comprovativo de Pagamento"
                                        className="max-w-full h-auto object-contain shadow-md"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
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
