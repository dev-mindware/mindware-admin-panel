"use client";
import { useTransition } from "react";
import { api } from "./services/api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsePaginatedFetchOptions {
  endpoint: string;
  queryKey: string[] | string;
  queryParams?: Record<string, any>;
  enabled?: boolean;
  keepPreviousData?: boolean;
  limit?: number;
  api?: any;
}

export function usePagination<T>({
  endpoint,
  queryKey,
  queryParams = {},
  enabled = true,
  keepPreviousData = true,
  limit: initialLimit = 10,
  api: apiInstance,
}: UsePaginatedFetchOptions) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || initialLimit;

  // Use the provided api instance or fall back to the default one
  const requestApi = apiInstance || api;

  const query = useQuery<PaginationResponse<T>>({
    queryKey: Array.isArray(queryKey)
      ? [...queryKey, page, limit, queryParams]
      : [queryKey, page, limit, queryParams],
    queryFn: async () => {
      const response = await requestApi.get(endpoint, {
        params: { page, limit, ...queryParams },
      });

      const raw = response.data;

      return {
        data: raw.items ?? raw.data ?? [],
        total: raw.total ?? 0,
        page: raw.page ?? page,
        limit: raw.limit ?? raw.size ?? limit,
        totalPages: raw.pages ?? raw.totalPages ?? (raw.total && (raw.limit || raw.size) ? Math.ceil(raw.total / (raw.limit || raw.size)) : 1),
      } satisfies PaginationResponse<T>;
    },
    enabled,
    gcTime: 300_000, // cache: 5min
    retry: 1,
    placeholderData: keepPreviousData ? (prev) => prev : undefined,
  });

  const updatePageInUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const goToNextPage = () => {
    if (query.data && page < query.data.totalPages) {
      updatePageInUrl(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      updatePageInUrl(page - 1);
    }
  };

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page,
    limit: query.data?.limit ?? limit,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading || isPending,
    isError: query.isError,
    goToNextPage,
    goToPreviousPage,
    setPage: updatePageInUrl,
    refetch: query.refetch,
  };
}
