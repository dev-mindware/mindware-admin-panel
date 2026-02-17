"use client";
import { useEffect } from "react";
import { Role } from "@/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";

interface RouteProtectorProps {
  allowed: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RouteProtector({
  allowed,
  children,
  fallback,
}: RouteProtectorProps) {
  const router = useRouter();
  const { user, isAuthenticating } = useAuth();

  useEffect(() => {
    // Só redireciona após autenticação completa
    if (isAuthenticating) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (!allowed.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [user, allowed, router, isAuthenticating]);

  // Enquanto está verificando autenticação/autorização
  if (isAuthenticating) {
    return (
      fallback || (
        <div className="flex items-center justify-center bg-red-600 min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )
    );
  }

  // Se não há usuário após verificação, retorna null (redirecionamento já foi feito)
  if (!user) {
    return null;
  }

  // Se usuário não tem permissão, retorna null (redirecionamento já foi feito)
  if (!allowed.includes(user.role)) {
    return null;
  }

  // Tudo verificado com sucesso, renderiza os children
  return <>{children}</>;
}
