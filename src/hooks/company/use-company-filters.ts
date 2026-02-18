"use client";

import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";

export function useCompanyFilters() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [isActive, setIsActive] = useQueryState("isActive", {
    parse: (v) => (v === "all" ? null : v === "true"),
    serialize: (v) => (v === null || v === undefined ? "all" : v.toString()),
  });
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsString.withDefault(""),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsString.withDefault(""),
  );
  const [createdAfter, setCreatedAfter] = useQueryState(
    "createdAfter",
    parseAsString.withDefault(""),
  );
  const [createdBefore, setCreatedBefore] = useQueryState(
    "createdBefore",
    parseAsString.withDefault(""),
  );

  const clearAllFilters = () => {
    setSearch("");
    setIsActive(null);
    setSortBy("");
    setSortOrder("");
    setCreatedAfter("");
    setCreatedBefore("");
  };

  const hasFilter =
    (search && search !== "") ||
    isActive !== null ||
    (sortBy && sortBy !== "") ||
    (sortOrder && sortOrder !== "") ||
    (createdAfter && createdAfter !== "") ||
    (createdBefore && createdBefore !== "");

  return {
    filters: {
      search,
      isActive,
      sortBy,
      sortOrder,
      createdAfter,
      createdBefore,
    },
    setFilters: (newFilters: {
      search?: string | null;
      isActive?: boolean | null;
      sortBy?: string | null;
      sortOrder?: string | null;
      createdAfter?: string | null;
      createdBefore?: string | null;
    }) => {
      if (newFilters.search !== undefined) setSearch(newFilters.search);
      if (newFilters.isActive !== undefined) setIsActive(newFilters.isActive);
      if (newFilters.sortBy !== undefined) setSortBy(newFilters.sortBy);
      if (newFilters.sortOrder !== undefined)
        setSortOrder(newFilters.sortOrder);
      if (newFilters.createdAfter !== undefined)
        setCreatedAfter(newFilters.createdAfter);
      if (newFilters.createdBefore !== undefined)
        setCreatedBefore(newFilters.createdBefore);
    },
    clearAllFilters,
    hasFilter,
  };
}
