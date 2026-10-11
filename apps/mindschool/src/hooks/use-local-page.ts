"use client";

import { useState } from "react";

/** Paginação local de listas pequenas que a API devolve inteiras (planos, personificações, administradores…): as props que o `GenericTable` pede. */
export function useLocalPage<T>(rows: T[], size = 10, resetKey: unknown = "") {
  const key = JSON.stringify(resetKey);
  // a página guardada só vale para os mesmos filtros: ao mudá-los volta-se à primeira, sem efeito
  const [state, setState] = useState({ key, page: 1 });
  const page = state.key === key ? state.page : 1;
  const setPage = (p: number) => setState({ key, page: p });
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(page, totalPages);
  return {
    rows: rows.slice((p - 1) * size, p * size),
    page: p,
    totalPages,
    total: rows.length,
    setPage,
    goToNextPage: () => setPage(Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setPage(Math.max(1, p - 1)),
  };
}
