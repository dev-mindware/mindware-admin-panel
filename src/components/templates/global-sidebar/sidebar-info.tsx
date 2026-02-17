"use client";

import {
  Icon,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components";
import { useAuth } from "@/hooks/auth";
export function SidebarCompanyInfo() {
  const { user } = useAuth();

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
          <div className="flex items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground aspect-square size-8">
            <Icon name="Building2" className="size-4" />
          </div>
          <div className="grid flex-1 text-sm leading-tight text-left">
            <span className="font-medium truncate">
              {user?.company?.name || "Empresa"}
            </span>
            <span className="text-xs truncate text-muted-foreground">
              {user?.name || "Utilizador"}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
