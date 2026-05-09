"use client";

import * as React from "react";
import { GlobalSidebar } from "@workspace/ui";
import { adminMenuItems } from "@/constants/menu-items";

import { useAuthStore } from "@/stores/auth/auth-store";
import { logoutAction } from "@/actions/logout";

export function AppSidebar(props: Omit<React.ComponentProps<typeof GlobalSidebar>, "user" | "teams" | "navMain" | "onLogout">) {
  const menuItems = adminMenuItems;
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    setUser(null);
    await logoutAction();
  };

  const userData = {
    name: user?.nome_completo || user?.email || "Admin Mindware",
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

  return (
    <GlobalSidebar
      user={userData}
      teams={teams}
      navMain={menuItems}
      onLogout={handleLogout}
      {...props}
    />
  );
}
