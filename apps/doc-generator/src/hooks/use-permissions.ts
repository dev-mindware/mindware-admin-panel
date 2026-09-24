"use client";

import { useAuthStore } from "@/stores/auth/auth-store";

const ALL_DOC_TYPES = ["proposal", "contract", "letter", "opinion", "official", "nda", "declaration"];

export function usePermissions() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  return {
    user,
    isAdmin,
    canManageUsers: isAdmin,
    canViewAuditLogs: isAdmin,
    canApproveDocuments: isAdmin,
    canCreateDocumentType: (type: string): boolean => {
      if (isAdmin) return true;
      return Boolean(user?.allowedDocumentTypes?.includes(type));
    },
    allowedDocumentTypes: isAdmin
      ? ALL_DOC_TYPES
      : (user?.allowedDocumentTypes ?? []),
  };
}
