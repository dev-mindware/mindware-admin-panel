"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { BASE_PATH } from "@/constants/routes";

/** Só deixa passar o administrador de sistema; qualquer outra sessão volta ao início de sessão. */
export function RouteProtector({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticating } = useAuthStore();
  const allowed = user?.role === "admin";

  useEffect(() => {
    if (!isAuthenticating && !allowed) window.location.replace(`${BASE_PATH}/auth/login`);
  }, [isAuthenticating, allowed]);

  if (isAuthenticating || !allowed) return null;
  return <>{children}</>;
}
