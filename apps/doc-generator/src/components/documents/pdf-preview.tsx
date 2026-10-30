"use client";

import { useEffect, useState } from "react";
import { Button, EmptyState, Icon } from "@workspace/ui";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  /** URL (blob:) do PDF. */
  url: string;
  title: string;
  filename?: string;
}

/** Ecrãs de toque: o iOS mostra só a 1.ª página de um PDF dentro de um iframe, e os telemóveis não têm espaço para o visor. */
function useTouchPrimary(): boolean {
  const narrow = useIsMobile();
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  return narrow || coarse;
}

/**
 * Pré-visualização de PDF. No computador, o PDF aparece na página; no
 * telemóvel e no tablet, abre-se no visor do sistema (que faz zoom, deslizar
 * e partilha) a partir de um botão.
 */
export function PdfPreview({ url, title, filename = "documento.pdf" }: Props) {
  const touch = useTouchPrimary();

  if (!touch) {
    return <iframe title={title} src={url} width="100%" height="800" />;
  }

  return (
    <EmptyState
      icon="FileText"
      title="PDF pronto"
      description="Abra no visor do telemóvel para ver todas as páginas, fazer zoom e partilhar."
      action={
        <>
          <Button asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Icon name="ExternalLink" />
              Abrir PDF
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={url} download={filename}>
              <Icon name="Download" />
              Descarregar
            </a>
          </Button>
        </>
      }
    />
  );
}
