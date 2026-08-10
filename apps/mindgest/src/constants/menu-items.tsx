import { Icon } from "@/components";
import { Role } from "@/types";

export type MenuItem = {
  name: string;
  url: string;
  icon?: React.ReactNode;
  showMoreIcon?: boolean;
  items?: MenuItem[];
};

export type MenuStructure = {
  items: MenuItem[];
};

export const menuItems: MenuStructure = {
  items: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: <Icon name="LayoutDashboard" />,
    },
    {
      name: "Empresas",
      url: "/companies",
      icon: <Icon name="Building" />,
    },
    {
      name: "Utilizadores",
      url: "/users",
      icon: <Icon name="Users" />,
    },
    {
      name: "Planos",
      url: "/plans",
      icon: <Icon name="Package" />,
    },
    {
      name: "Subscrições",
      url: "/subscriptions",
      icon: <Icon name="Wallet" />,
    },
    {
      name: "Email Marketing",
      url: "/email-marketing/dashboard",
      icon: <Icon name="Mail" />,
      items: [
        { name: "Dashboard", url: "/email-marketing/dashboard" },
        { name: "Campanhas", url: "/email-marketing/campaigns" },
        { name: "Templates", url: "/email-marketing/templates" },
        { name: "Automações", url: "/email-marketing/automations" },
      ],
    },
    {
      name: "Logs do Sistema",
      url: "/logs",
      icon: <Icon name="FileSearch" />,
    },
    {
      name: "Definições",
      url: "/definitions",
      icon: <Icon name="Settings2" />,
    },
  ],
};

