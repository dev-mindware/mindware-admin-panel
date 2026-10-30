import { toast } from "sonner";
import { documentsService } from "@/services/documents-service";

const message = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export async function openDocumentPdf(documentId: string): Promise<void> {
  try {
    await documentsService.openPdf(documentId);
  } catch (err) {
    toast.error(message(err, "Não foi possível abrir o PDF."));
  }
}

export async function downloadDocumentPdf(documentId: string, filename?: string): Promise<void> {
  try {
    await documentsService.downloadPdf(documentId, filename);
  } catch (err) {
    toast.error(message(err, "Não foi possível descarregar o PDF."));
  }
}
