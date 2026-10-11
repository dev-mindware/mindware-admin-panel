"use client";

import { useMe } from "@/hooks/auth/use-me";

/** Mostra o conteúdo só a quem tem a permissão `platform:*` da API (a API continua a ser a barreira; isto só evita botões inúteis). */
export function PermissionGate({ permission, children, fallback = null }: { permission: string | string[]; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { can, isLoading } = useMe();
  if (isLoading) return null;
  const list = Array.isArray(permission) ? permission : [permission];
  return <>{list.some(can) ? children : fallback}</>;
}
