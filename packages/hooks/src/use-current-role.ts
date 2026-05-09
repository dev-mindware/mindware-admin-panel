"use client";
import type { MindgestRole } from "@workspace/types";
import { getUserRole } from "@workspace/utils";
import { useAuth } from "./auth";

export function useCurrentRole() {
  const { user } = useAuth();

  const isAdmin = getUserRole(user?.role as MindgestRole) == "admin";

  return {
    currentRole: getUserRole(user?.role as MindgestRole),
    isAdmin,
  };
}
