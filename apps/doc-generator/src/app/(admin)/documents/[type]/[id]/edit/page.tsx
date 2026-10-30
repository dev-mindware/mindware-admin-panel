import { notFound } from "next/navigation";
import { getDocumentTypeBySlug } from "@/constants/document-types";
import { TextDocumentView } from "@/components/documents/TextDocumentView";

interface PageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

export default async function DocumentTypeEditPage({ params }: PageProps) {
  const { type, id } = await params;
  const typeConfig = getDocumentTypeBySlug(type);

  // A edição por formulário existe para os tipos de texto; as propostas editam-se no painel lateral.
  if (!typeConfig || typeConfig.slug === "proposal") {
    notFound();
  }

  return <TextDocumentView typeConfig={typeConfig} documentId={id} />;
}
