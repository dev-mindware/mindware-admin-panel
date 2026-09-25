"use client";
import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { BASE_PATH } from "@/constants/routes";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/auth";
import { deleteCookie } from "cookies-next";

interface RouteProtectorProps {
  allowed: string[];
  children: React.ReactNode;
}

export function RouteProtector({
  allowed,
  children,
}: RouteProtectorProps) {
  const { user, isAuthenticating } = useAuthStore();
  const allowedRoles = useMemo(() => allowed.map((role) => role.toLowerCase()), [allowed]);
  const userRole = user?.role?.toLowerCase();

  useEffect(() => {
    if (isAuthenticating) return;

    // window.location respects basePath only when we include it explicitly.
    if (!user || !userRole || !allowedRoles.includes(userRole)) {
      deleteCookie(ACCESS_TOKEN_KEY, { path: "/" });
      deleteCookie(REFRESH_TOKEN_KEY, { path: "/" });
      window.location.replace(`${BASE_PATH}/auth/login`);
    }
  }, [user, userRole, allowedRoles, isAuthenticating]);

  if (isAuthenticating) {
    return null;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
