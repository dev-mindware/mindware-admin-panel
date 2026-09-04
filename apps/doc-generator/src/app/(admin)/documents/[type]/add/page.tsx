import { notFound } from "next/navigation";
import { getDocumentTypeBySlug } from "@/constants/document-types";
import { DocumentCreateView } from "@/components/documents/DocumentCreateView";

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

  return <DocumentCreateView typeConfig={typeConfig} />;
}
