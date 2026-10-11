"use client";

import * as React from "react";
import { GlobalSidebar, Icon } from "@workspace/ui";
import { adminMenuItems } from "@/constants/menu-items";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useMe } from "@/hooks/auth/use-me";
import { logoutAction } from "@/actions/login";
import { resetAccessTokenCache } from "@/services/api";
import { BASE_PATH } from "@/constants/routes";

export function AppSidebar(props: Partial<React.ComponentProps<typeof GlobalSidebar>>) {
  const { user, setUser } = useAuthStore();
  const { permissions } = useMe();

  const handleLogout = async () => {
    setUser(null);
    resetAccessTokenCache();
    await logoutAction();
    window.location.replace(`${BASE_PATH}/auth/login`);
  };

  const navMain = adminMenuItems
    .filter((i) => !i.permissions || permissions.size === 0 || i.permissions.some((p) => permissions.has(p)))
    .map((item) => ({
      title: item.name,
      url: item.url,
      icon: ({ className }: { className?: string }) => <Icon name={item.icon} className={className} />,
    }));

  return (
    <GlobalSidebar
      user={{ name: user?.name || user?.email || "Administrador", email: user?.email || "", avatar: "" }}
      teams={[{ name: "MindSchool", logo: `${BASE_PATH}/mindware.png`, plan: "Administração da plataforma" }]}
      navMain={navMain}
      onLogout={handleLogout}
      {...props}
    />
  );
}
