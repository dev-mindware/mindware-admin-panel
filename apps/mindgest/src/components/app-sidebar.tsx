"use client";

import * as React from "react";
import { GlobalSidebar } from "@workspace/ui";
import { menuItems } from "@/constants/menu-items";
import { useAuth, useLogout } from "@/hooks/auth";

export function AppSidebar(props: Partial<React.ComponentProps<typeof GlobalSidebar>>) {
  const { user } = useAuth();
  const { logout } = useLogout();

  const sidebarUser = {
    name: user?.name || "Admin",
    email: user?.email || "",
    avatar: "",
  };

  const teams = [
    {
      name: user?.company?.name || "Mindware",
      logo: "Building2",
      plan: "Empresa",
    },
  ];

  // Map Mindgest menu items to GlobalSidebar structure if needed
  // In Mindgest MenuItem has 'name' instead of 'title'
  const navMain = menuItems.items.map(item => ({
    title: item.name,
    url: item.url,
    icon: (props: any) => item.icon, // Wrap ReactNode in function if Icon component expects it
    items: item.items?.map(sub => ({ title: sub.name, url: sub.url }))
  }));

  return (
    <GlobalSidebar
      user={sidebarUser}
      teams={teams}
      navMain={navMain}
      onLogout={logout}
      {...props}
    />
  );
}
