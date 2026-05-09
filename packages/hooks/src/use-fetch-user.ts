"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "./auth/auth-store";
import { api } from "./services/api";
import { BaseUser as User } from "@workspace/types";

interface UseFetchUserOptions {
  enabled?: boolean;
  api?: any;
  endpoint?: string;
}

export function useFetchUser<TUser = User>({ 
  enabled = true, 
  api: apiInstance,
  endpoint = "/auth/profile"
}: UseFetchUserOptions = {}) {
  const { setUser, user, setIsAuthenticating } = useAuthStore();
  const hasFetched = useRef(false);

  // Use the provided api instance or fall back to the default one
  const requestApi = apiInstance || api;

  useEffect(() => {
    if (!enabled) {
      setIsAuthenticating(false);
      return;
    }

    if (user !== null) {
      setIsAuthenticating(false);
      return;
    }

    if (hasFetched.current) {
      return;
    }

    let isMounted = true;
    hasFetched.current = true;
    // Ensure we start in a loading state if we are going to fetch
    setIsAuthenticating(true);

    const fetchUser = async () => {
      try {
        const response = await requestApi.get(endpoint);
        const data = response.data as TUser;

        if (!isMounted) return;

        setUser(data as any);
      } catch (error: any) {
        if (!isMounted) return;

        if (error.response?.status !== 401) {
          console.error("Erro ao buscar usuário:", error);
        }
        setUser(null);
      } finally {
        if (isMounted) {
          setIsAuthenticating(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [enabled, endpoint]);

  return { user: user as unknown as TUser | null };
}
