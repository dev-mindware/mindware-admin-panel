"use client";

import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";
import type { User, UserFilters } from "@/types";

export function useUsers(filters?: UserFilters) {
  return usePagination<User>({
    endpoint: "/users",
    queryKey: "users",
    api,
    queryParams: {
      search: filters?.search || undefined,
      role: filters?.role || undefined,
      status: filters?.status || undefined,
      companyId: filters?.companyId || undefined,
      storeId: filters?.storeId || undefined,
      sortBy: filters?.sortBy || undefined,
      sortOrder: filters?.sortOrder || undefined,
      createdAfter: filters?.createdAfter || undefined,
      createdBefore: filters?.createdBefore || undefined,
    },
  });
}
