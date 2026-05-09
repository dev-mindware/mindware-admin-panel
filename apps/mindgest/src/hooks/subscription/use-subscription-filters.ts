"use client";

import { useQueryState, parseAsString } from "nuqs";

export function useSubscriptionFilters() {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [company, setCompany] = useQueryState(
    "company",
    parseAsString.withDefault(""),
  );

  const clearAllFilters = () => {
    setStatus(null);
    setCompany(null);
  };

  const hasFilter = (status && status !== "") || (company && company !== "");

  return {
    filters: {
      status,
      company,
    },
    setFilters: (newFilters: {
      status?: string | null;
      company?: string | null;
    }) => {
      if (newFilters.status !== undefined) setStatus(newFilters.status);
      if (newFilters.company !== undefined) setCompany(newFilters.company);
    },
    clearAllFilters,
    hasFilter,
  };
}
