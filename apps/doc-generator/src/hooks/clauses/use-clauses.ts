"use client";

import { useQuery } from "@tanstack/react-query";
import { clausesService, ClauseFilterParams } from "@/services/clauses-service";

export const clauseKeys = {
  all: ["clauses"] as const,
  list: (params?: ClauseFilterParams) => ["clauses", "list", params] as const,
  categories: ["clause-categories"] as const,
};

export function useClausesList(params?: ClauseFilterParams) {
  return useQuery({
    queryKey: clauseKeys.list(params),
    queryFn: () => clausesService.getClauses(params),
  });
}

export function useClauseCategories() {
  return useQuery({
    queryKey: clauseKeys.categories,
    queryFn: () => clausesService.getCategories(),
  });
}

