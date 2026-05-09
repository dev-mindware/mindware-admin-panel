"use client";
import { useFetchUser } from "@workspace/hooks";
import { useAuthStore } from "@workspace/hooks";
import { Loader } from "./loader";
import { usePathname } from "next/navigation";
import { api } from "@/services/api";


interface AuthProviderProps {
  children: React.ReactNode;
}

const AUTH_PATHS = ["/auth", "/login", "/register"];

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.some((path) => pathname.startsWith(path));
  const { isAuthenticating } = useAuthStore();
  useFetchUser({ enabled: !isAuthRoute, api });

  if (isAuthRoute) {
    return <>{children}</>;
  }


  if (isAuthenticating) {
    return <Loader />;
  }

  return <>{children}</>;
}