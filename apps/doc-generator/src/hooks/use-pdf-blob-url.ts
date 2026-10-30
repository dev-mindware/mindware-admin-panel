"use client";

import { useEffect, useState } from "react";
import { documentsService } from "@/services/documents-service";

interface PdfBlobState {
  url: string | null;
  loading: boolean;
  error: boolean;
}

/**
 * URL temporário (blob:) do PDF de um documento, para usar num <iframe>.
 * Pede o ficheiro com o token do utilizador e liberta o URL ao desmontar ou
 * quando o documento muda. `version` força novo pedido (ex.: após regenerar).
 */
export function usePdfBlobUrl(
  documentId: string | null | undefined,
  enabled = true,
  version?: string | number,
): PdfBlobState {
  const [state, setState] = useState<PdfBlobState>({ url: null, loading: false, error: false });

  useEffect(() => {
    if (!documentId || !enabled) {
      setState({ url: null, loading: false, error: false });
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    setState({ url: null, loading: true, error: false });

    documentsService
      .fetchPdfBlob(documentId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        setState({ url: objectUrl, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ url: null, loading: false, error: true });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentId, enabled, version]);

  return state;
}
