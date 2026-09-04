"use client";

import * as React from "react";
import { GlobalSidebar } from "@workspace/ui";
import { adminMenuItems, MenuItem } from "@/constants/menu-items";
import { useAuthStore } from "@/stores/auth/auth-store";

export function AppSidebar(props: Partial<React.ComponentProps<typeof GlobalSidebar>>) {
  const { user, logout } = useAuthStore();

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
      name: "Doc Generator",
      logo: "FileText",
      plan: "Document Engine",
    },
  ];

  const navMain = adminMenuItems.items.map((item: MenuItem) => ({
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