"use client";

import { parseAsString, useQueryState } from "nuqs";
import type { UserFilters, UserRole, UserStatus } from "@/types";

export function useUserFilters() {
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [role, setRole] = useQueryState("role", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
  const [companyId, setCompanyId] = useQueryState("companyId", parseAsString.withDefault(""));
  const [storeId, setStoreId] = useQueryState("storeId", parseAsString.withDefault(""));
  const [sortBy, setSortBy] = useQueryState("sortBy", parseAsString.withDefault(""));
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", parseAsString.withDefault(""));
  const [createdAfter, setCreatedAfter] = useQueryState("createdAfter", parseAsString.withDefault(""));
  const [createdBefore, setCreatedBefore] = useQueryState("createdBefore", parseAsString.withDefault(""));

  const filters: UserFilters = {
    search,
    role: role ? (role as UserRole) : null,
    status: status ? (status as UserStatus) : null,
    companyId,
    storeId,
    sortBy: sortBy as UserFilters["sortBy"],
    sortOrder: sortOrder as UserFilters["sortOrder"],
    createdAfter,
    createdBefore,
  };

  const setFilters = (newFilters: UserFilters) => {
    if (newFilters.search !== undefined) setSearch(newFilters.search);
    if (newFilters.role !== undefined) setRole(newFilters.role);
    if (newFilters.status !== undefined) setStatus(newFilters.status);
    if (newFilters.companyId !== undefined) setCompanyId(newFilters.companyId);
    if (newFilters.storeId !== undefined) setStoreId(newFilters.storeId);
    if (newFilters.sortBy !== undefined) setSortBy(newFilters.sortBy);
    if (newFilters.sortOrder !== undefined) setSortOrder(newFilters.sortOrder);
    if (newFilters.createdAfter !== undefined) setCreatedAfter(newFilters.createdAfter);
    if (newFilters.createdBefore !== undefined) setCreatedBefore(newFilters.createdBefore);
  };

  const clearAllFilters = () => {
    setSearch(null);
    setRole(null);
    setStatus(null);
    setCompanyId(null);
    setStoreId(null);
    setSortBy(null);
    setSortOrder(null);
    setCreatedAfter(null);
    setCreatedBefore(null);
  };

  const hasFilter = Object.values(filters).some(Boolean);

  return { filters, setFilters, clearAllFilters, hasFilter };
}
