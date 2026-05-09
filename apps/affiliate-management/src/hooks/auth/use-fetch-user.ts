"use client";
import { useFetchUser as useSharedFetchUser } from "@workspace/hooks";
import { api } from "@/services/api";
import { User } from "@/stores/auth/auth-store";

export function useFetchUser({ enabled = true }: { enabled?: boolean } = {}) {
  return useSharedFetchUser<User>({
    enabled,
    api,
    endpoint: "/auth/me"
  });
}
