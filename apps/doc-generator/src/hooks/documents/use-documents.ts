"use client";

import { useQuery } from "@tanstack/react-query";
import { documentsService, DocumentFilterParams } from "@/services/documents-service";

export const documentKeys = {
  all: ["documents"] as const,
  list: (params?: DocumentFilterParams) => ["documents", "list", params] as const,
  detail: (id: string) => ["documents", "detail", id] as const,
};

export function useDocumentsList(params?: DocumentFilterParams) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => documentsService.getDocuments(params),
  });
}

