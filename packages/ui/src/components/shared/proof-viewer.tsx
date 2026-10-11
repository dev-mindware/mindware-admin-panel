"use client";

import { useEffect, useState } from "react";
import { useModalStore } from "@workspace/hooks";
import { GlobalModal } from "../modal";
import { Icon } from "../common/icon";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface ProofViewerProps {
  id?: string;
  /** Vai buscar o ficheiro com a sessão do utilizador (o comprovativo nunca é público). */
  loadProof: (orderId: string) => Promise<{ blob: Blob; fileName: string }>;
}

/**
 * Visualizador de comprovativos de pagamento (PDF ou imagem): abre com `openModal(id, orderId)`, carrega o ficheiro autenticado
 * e mostra-o numa moldura; permite descarregar e abrir noutro separador. Liberta o URL temporário ao fechar.
 */
export function ProofViewer({ id = "view-proof", loadProof }: ProofViewerProps) {
  const { open, modalData, closeModal } = useModalStore();
  const isOpen = !!open[id];
  const orderId = modalData[id] as string | undefined;
  const [state, setState] = useState<{ url: string; fileName: string; isPdf: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;
    let url: string | null = null;
    let cancelled = false;
    setState(null);
    setError(null);
    loadProof(orderId)
      .then(({ blob, fileName }) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setState({ url, fileName, isPdf: blob.type === "application/pdf" });
      })
      .catch(() => !cancelled && setError("Não foi possível carregar o comprovativo."));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [isOpen, orderId, loadProof]);

  if (!isOpen) return null;

  return (
    <GlobalModal
      id={id}
      size="xl"
      className="h-[92vh]"
      title={
        <span className="flex items-center gap-2">
          <Icon name="FileText" className="size-5 text-primary" />
          Comprovativo de pagamento
        </span>
      }
      footer={
        <div className="flex justify-end gap-2">
          {state && (
            <>
              <Button variant="outline" asChild>
                <a href={state.url} download={state.fileName}>
                  <Icon name="Download" className="size-4" />
                  Descarregar
                </a>
              </Button>
              <Button asChild>
                <a href={state.url} target="_blank" rel="noreferrer">
                  <Icon name="ExternalLink" className="size-4" />
                  Abrir noutro separador
                </a>
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => closeModal(id)}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-lg border bg-muted/50">
        {error ? (
          <div className="space-y-3 p-12 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
              <Icon name="FileWarning" className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : !state ? (
          <Skeleton className="h-[70vh] w-full" />
        ) : state.isPdf ? (
          <iframe src={state.url} title="Comprovativo em PDF" className="h-[75vh] w-full rounded-md" />
        ) : (
          <div className="flex max-h-[75vh] w-full justify-center overflow-auto p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.url} alt="Comprovativo de pagamento" className="h-auto max-w-full rounded-md object-contain shadow-md" />
          </div>
        )}
      </div>
    </GlobalModal>
  );
}
