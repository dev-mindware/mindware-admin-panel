"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "../../ui/sidebar";
import { Icon } from "../../common/icon";
import { useState } from "react";
import { cn } from "@workspace/utils";

export interface MenuItem {
  title: string;
  url: string;
  icon?: any;
  isActive?: boolean;
  showMoreIcon?: boolean;
  items?: MenuItem[];
}

export function NavMenu({ items }: { items: MenuItem[] }) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const toggleSubmenu = (title: string) =>
    setOpenSubmenu((prev) => (prev === title ? null : title));

  const isActive = (url: string) => pathname.startsWith(url);

  const handleMobileClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu className="group-data-[collapsible=icon]:items-center">
        {items.map((item) => {
          const hasSubmenu = !!item.items?.length;
          const isOpen = openSubmenu === item.title;
          const activeMain =
            isActive(item.url) ||
            item.items?.some((sub) => isActive(sub.url));

          const IconComponent = item.icon;

          return (
            <SidebarMenuItem key={item.title}>
              {hasSubmenu ? (
                <>
                  <SidebarMenuButton
                    onClick={() => toggleSubmenu(item.title)}
                    tooltip={item.title}
                    className={cn(
                      activeMain
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-sidebar-accent "
                    )}
                  >
                    {IconComponent && (
                      typeof IconComponent === 'string' 
                        ? <Icon name={IconComponent as any} /> 
                        : <IconComponent className="size-4" />
                    )}
                    <span>{item.title}</span>
                    <Icon
                      name="ChevronRight"
                      className={`ml-auto transition-transform duration-200 ${isOpen ? "rotate-90" : ""
                        }`}
                    />
                  </SidebarMenuButton>

                  {isOpen && (
                    <SidebarMenuSub>
                      {item.items!.map((sub) => {
                        const activeSub = isActive(sub.url);
                        return (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={cn(
                                activeSub
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-sidebar-accent "
                              )}
                            >
                              <Link href={sub.url} onClick={handleMobileClick}>
                                <span>{sub.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  )}
                </>
              ) : (
                <>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    onClick={handleMobileClick}
                    className={cn(
                      activeMain
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-sidebar-accent "
                    )}
                  >
                    <Link href={item.url}>
                      {IconComponent && (
                        typeof IconComponent === 'string' 
                          ? <Icon name={IconComponent as any} /> 
                          : <IconComponent className="size-4" />
                      )}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.showMoreIcon && (
                    <SidebarMenuAction>
                      <Icon name="Loader" className="text-primary" />
                    </SidebarMenuAction>
                  )}
                </>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
