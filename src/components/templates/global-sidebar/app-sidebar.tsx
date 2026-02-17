"use client";
import {
  NavMenu,
  UserInfo,
  Sidebar,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSkeleton,
  SidebarCompanyInfo,
} from "@/components";
import { menuItems } from "@/constants/menu-items";
import { useAuth } from "@/hooks/auth";


export function AppSidebar() {
  const { user } = useAuth();

  if (!user) return <SidebarSkeleton />;

  // Admin panel uses static menu items
  const filteredMenu = menuItems.items;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarCompanyInfo />
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:items-center mt-4">
        <NavMenu items={filteredMenu} />
      </SidebarContent>
      <SidebarFooter>
        <UserInfo />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
