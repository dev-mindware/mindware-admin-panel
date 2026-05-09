"use client";
import * as React from "react";
import {
  Sidebar,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "../../ui/sidebar";
import { NavMenu } from "./nav-components";
import { UserInfo } from "./user-info";
import { SidebarCompanyInfo } from "./sidebar-info";

import { useAuth } from "@workspace/hooks";

interface GlobalSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  teams: Array<{
    name: string;
    logo: React.ElementType | string;
    plan: string;
  }>;
  navMain: Array<{
    title: string;
    url: string;
    icon?: React.ElementType;
    isActive?: boolean;
    items?: Array<{
      title: string;
      url: string;
    }>;
  }>;
  onLogout?: () => void;
}

export function GlobalSidebar({ user: userProp, teams, navMain, onLogout, ...props }: GlobalSidebarProps) {
  const { user: authUser } = useAuth();

  const displayUser = authUser ? {
    name: (authUser as any).name || (authUser as any).nome_completo || userProp.name,
    email: authUser.email || userProp.email || "",
    avatar: (authUser as any).avatar || userProp.avatar,
  } : userProp;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarCompanyInfo teams={teams} />
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:items-center mt-4">
        <NavMenu items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <UserInfo user={displayUser} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
