import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDocumentTypeBySlug } from "@/constants/document-types";
import { DocumentCategoryView } from "@/components/documents/DocumentCategoryView";

interface PageProps {
  params: Promise<{
    type: string;
  }>;
}

export default async function DocumentTypePage({ params }: PageProps) {
  const resolvedParams = await params;
  const typeConfig = getDocumentTypeBySlug(resolvedParams.type);

  if (!typeConfig) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <DocumentCategoryView typeConfig={typeConfig} />
    </Suspense>
  );
}
