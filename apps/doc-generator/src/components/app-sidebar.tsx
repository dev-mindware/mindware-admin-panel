"use client";

import * as React from "react";
import { GlobalSidebar } from "@workspace/ui";
import { adminMenuItems, MenuItem } from "@/constants/menu-items";
import { useAuthStore } from "@/stores/auth/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import { DOCUMENT_TYPES } from "@/constants/document-types";

export function AppSidebar(props: Partial<React.ComponentProps<typeof GlobalSidebar>>) {
  const { user, logout } = useAuthStore();
  const { isAdmin, canCreateDocumentType } = usePermissions();

  const handleLogout = async () => {
    logout();
  };

  const userData = {
    name: user?.name || "Admin Mindware",
    email: user?.email || "admin@mindware.ao",
    avatar: "",
  };

  const teams = [
    {
      name: "Mindware",
      logo: "/doc-generator/mindware.png",
      plan: "Doc Generator",
    },
  ];

  // Filter menu items based on permissions
  const filteredItems = adminMenuItems.items
    .filter((item: MenuItem) => {
      // Hide admin-only items from editors
      if (item.adminOnly && !isAdmin) return false;
      return true;
    })
    .map((item: MenuItem) => {
      // Filter document sub-items to only allowed types for editors
      if (item.url === "#" && item.items && !isAdmin) {
        const allowedItems = item.items.filter((sub) => {
          const slug = sub.url.split("/").pop() || "";
          return canCreateDocumentType(slug);
        });
        return { ...item, items: allowedItems };
      }
      return item;
    });

  const navMain = filteredItems.map((item: MenuItem) => ({
    title: item.name,
    url: item.url,
    icon: () => (item.icon as any) || null,
    items: item.items?.map((sub: MenuItem) => ({ title: sub.name, url: sub.url })),
  }));

  return (
    <GlobalSidebar
      user={userData}
      teams={teams}
      navMain={navMain}
      onLogout={handleLogout}
      {...props}
    />
  );
}
