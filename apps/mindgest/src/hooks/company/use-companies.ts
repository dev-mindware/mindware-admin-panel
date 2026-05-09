"use client";

import { usePagination } from "@workspace/hooks";
import { Company } from "@/types";
import { api } from "@/services/api";

export function useCompanies(filters?: {
  search?: string | null;
  isActive?: boolean | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  createdAfter?: string | null;
  createdBefore?: string | null;
}) {
  return usePagination<Company>({
    endpoint: "/companies",
    queryKey: "companies",
    api,
    queryParams: {
      search: filters?.search || undefined,
      isActive: filters?.isActive === null ? undefined : filters?.isActive,
      sortBy: filters?.sortBy || undefined,
      sortOrder: filters?.sortOrder || undefined,
      createdAfter: filters?.createdAfter || undefined,
      createdBefore: filters?.createdBefore || undefined,
    },
  });
}
