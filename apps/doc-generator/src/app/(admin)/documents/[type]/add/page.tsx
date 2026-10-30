import { notFound } from "next/navigation";
import { getDocumentTypeBySlug } from "@/constants/document-types";
import { DocumentCreateView } from "@/components/documents/DocumentCreateView";
import { TextDocumentView } from "@/components/documents/TextDocumentView";

interface PageProps {
  params: Promise<{
    type: string;
  }>;
}

export default async function DocumentTypeAddPage({ params }: PageProps) {
  const resolvedParams = await params;
  const typeConfig = getDocumentTypeBySlug(resolvedParams.type);

  if (!typeConfig) {
    notFound();
  }

  // As propostas têm o editor próprio (capa, escopo, páginas); os outros tipos usam formulários por tipo.
  if (typeConfig.slug === "proposal") {
    return <DocumentCreateView typeConfig={typeConfig} />;
  }
  return <TextDocumentView typeConfig={typeConfig} />;
}
