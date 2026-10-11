"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiMe } from "@/types/api";

export const ME_KEY = ["me"] as const;

/** Perfil do administrador autenticado (`/auth/me`), com as permissões efectivas e o estado do segundo factor. */
export function useMe(enabled = true) {
  const q = useQuery({ queryKey: ME_KEY, queryFn: async () => (await api.get<ApiMe>("/auth/me")).data, staleTime: 60_000, retry: false, enabled });
  const permissions = new Set(q.data?.memberships.flatMap((m) => m.permissions ?? []) ?? []);
  const isPlatformAdmin = Boolean(q.data?.memberships.some((m) => m.roles.includes("admin_sistema")));
  return { ...q, me: q.data, permissions, isPlatformAdmin, can: (p: string) => permissions.has(p) };
}
