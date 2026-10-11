"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useMe } from "@/hooks/auth/use-me";
import { Loader } from "./loader";

/** Carrega o perfil do administrador para o `useAuthStore` partilhado (nome, email, papel) fora das páginas de autenticação. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");
  const { setUser, setIsAuthenticating, isAuthenticating } = useAuthStore();
  const { me, isLoading, isError, isPlatformAdmin } = useMe(!isAuthRoute);

  useEffect(() => {
    if (isAuthRoute) {
      setIsAuthenticating(false);
      return;
    }
    if (isLoading) return;
    if (me && isPlatformAdmin) setUser({ id: me.id, email: me.email, name: me.full_name, phone: "", role: "admin" });
    else setUser(null);
    setIsAuthenticating(false);
  }, [isAuthRoute, isLoading, isError, me, isPlatformAdmin, setUser, setIsAuthenticating]);

  if (!isAuthRoute && isAuthenticating) return <Loader />;
  return <>{children}</>;
}
