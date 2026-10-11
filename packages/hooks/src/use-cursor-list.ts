"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";

export interface CursorPage<T> {
  data: T[];
  page: { limit: number; has_more: boolean; next_cursor: string | null };
}

interface UseCursorListOptions<T> {
  queryKey: QueryKey;
  /** Busca uma página da API; `cursor` é o `next_cursor` da anterior. */
  fetchPage: (cursor: string | undefined) => Promise<CursorPage<T>>;
  /** Linhas por página mostradas na tabela (a API pode devolver mais por pedido). */
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Lista com paginação por cursor da API apresentada em páginas numeradas (`GenericTable`): os pedidos acumulam-se e a tabela
 * mostra uma fatia; ao chegar à última página carregada, «seguinte» vai buscar a página seguinte à API. Mudar os filtros (`queryKey`) volta à página 1.
 */
export function useCursorList<T extends { id: string | number }>({ queryKey, fetchPage, pageSize = 10, enabled = true }: UseCursorListOptions<T>) {
  const q = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam || undefined),
    initialPageParam: "" as string,
    getNextPageParam: (last) => (last.page.has_more ? (last.page.next_cursor ?? undefined) : undefined),
    staleTime: 15_000,
    retry: false,
    enabled,
  });
  const [page, setPage] = useState(1);
  const key = JSON.stringify(queryKey);
  useEffect(() => setPage(1), [key]);

  const all = useMemo(() => q.data?.pages.flatMap((p) => p.data) ?? [], [q.data]);
  const loadedPages = Math.max(1, Math.ceil(all.length / pageSize));
  // enquanto a API tiver mais, mostra-se uma página «a mais» para o utilizador poder avançar
  const totalPages = q.hasNextPage ? loadedPages + 1 : loadedPages;
  const rows = all.slice((page - 1) * pageSize, page * pageSize);

  const goTo = useCallback(
    (next: number) => {
      const target = Math.max(1, Math.min(next, totalPages));
      if (target > loadedPages && q.hasNextPage && !q.isFetchingNextPage) {
        void q.fetchNextPage().then(() => setPage(target));
      } else if (target <= loadedPages) {
        setPage(target);
      }
    },
    [totalPages, loadedPages, q],
  );

  return {
    rows,
    loaded: all.length,
    all,
    page,
    totalPages,
    hasMore: Boolean(q.hasNextPage),
    isLoading: q.isLoading,
    isError: q.isError,
    isFetching: q.isFetching,
    isFetchingMore: q.isFetchingNextPage,
    refetch: q.refetch,
    setPage: goTo,
    goToNextPage: () => goTo(page + 1),
    goToPreviousPage: () => goTo(page - 1),
  };
}
