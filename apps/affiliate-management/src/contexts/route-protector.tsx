"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth/auth-store";

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

  useEffect(() => {
    if (isAuthenticating) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (!allowed.includes(user.role)) {
      router.replace("/auth/login"); // or /unauthorized if exists
    }
  }, [user, allowed, router, isAuthenticating]);

  if (isAuthenticating) {
    return null; // AuthProvider handles initial loading
  }

  if (!user || !allowed.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
