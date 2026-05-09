"use client";

import * as React from "react";
import { GlobalSidebar } from "@workspace/ui";
import { adminMenuItems } from "@/constants/menu-items";

import { useAuthStore } from "@/stores/auth/auth-store";
import { logoutAction } from "@/actions/logout";

export function AppSidebar(props: Partial<React.ComponentProps<typeof GlobalSidebar>>) {
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    setUser(null);
    await logoutAction();
  };

  const userData = {
    name: (user as any)?.nome_completo || user?.email || "Admin Mindware",
    email: user?.email || "admin@mindware.ao",
    avatar: "",
  };

  const teams = [
    {
      name: "Mindware Affiliate",
      logo: "Building2",
      plan: "Management System",
    },
  ];

  // Mapeia os itens seguindo o padrão do Mindgest para o GlobalSidebar
  const navMain = adminMenuItems.items.map(item => ({
    title: item.name,
    url: item.url,
    icon: (props: any) => item.icon,
    items: item.items?.map(sub => ({ title: sub.name, url: sub.url }))
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
