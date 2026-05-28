import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useURLSearchParams(_prefix?: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getParam = useCallback((key: string) => searchParams.get(key), [searchParams]);

  const setParam = useCallback(
    (key: string, value: string | null | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setParams = useCallback(
    (newParams: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const clearParams = useCallback(
    (newParams?: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams();
      if (newParams) {
        Object.entries(newParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            params.set(key, String(value));
          }
        });
      }
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [pathname, router],
  );

  const page = parseInt(searchParams.get("page") || "1", 10);
  const setPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPage));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const search = getParam("search") || "";
  const setSearch = useCallback((value: string) => setParam("search", value), [setParam]);

  return {
    getParam,
    setParam,
    setParams,
    clearParams,
    page,
    setPage,
    search,
    setSearch,
  };
}
