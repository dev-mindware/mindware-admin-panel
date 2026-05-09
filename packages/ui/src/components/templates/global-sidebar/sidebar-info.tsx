"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import { Icon } from "../../common/icon";

interface SidebarCompanyInfoProps {
  teams?: Array<{
    name: string;
    logo: any;
    plan: string;
  }>;
}

export function SidebarCompanyInfo({ teams }: SidebarCompanyInfoProps) {
  const team = teams?.[0] || { name: "Empresa", plan: "Sistema", logo: null };

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
          <div className="flex items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground aspect-square size-8">
             {typeof team.logo === 'string' ? (
                <img src={team.logo} alt={team.name} className="size-4" />
             ) : (
                <Icon name="Building2" className="size-4" />
             )}
          </div>
          <div className="grid flex-1 text-sm leading-tight text-left">
            <span className="font-medium truncate">
              {team.name}
            </span>
            <span className="text-xs truncate text-muted-foreground">
              {team.plan}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
