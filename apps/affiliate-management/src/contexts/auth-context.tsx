"use client";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useFetchUser } from "@/hooks/auth/use-fetch-user";
import { Loader } from "./loader";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AUTH_PATHS = ["/auth", "/login"];

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.some((path) => pathname.startsWith(path));
  const { isAuthenticating } = useAuthStore();
  
  useFetchUser({ enabled: !isAuthRoute });

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isAuthenticating) {
    return <Loader />;
  }

  return <>{children}</>;
}
