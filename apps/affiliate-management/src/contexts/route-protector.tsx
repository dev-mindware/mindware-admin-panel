"use client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth/auth-store";
import { BASE_PATH } from "@/constants/routes";

interface RouteProtectorProps {
  allowed: string[];
  children: React.ReactNode;
}

export function RouteProtector({
  allowed,
  children,
}: RouteProtectorProps) {
  const router = useRouter();
  const { user, isAuthenticating } = useAuthStore();
  const loginPath = `${BASE_PATH}/auth/login`;
  const allowedRoles = useMemo(() => allowed.map((role) => role.toLowerCase()), [allowed]);
  const userRole = user?.role?.toLowerCase();

  useEffect(() => {
    if (isAuthenticating) return;

    if (!user) {
      router.replace(loginPath);
      return;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      router.replace(loginPath);
    }
  }, [user, userRole, allowedRoles, router, isAuthenticating, loginPath]);

  if (isAuthenticating) {
    return null; // AuthProvider handles initial loading
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
