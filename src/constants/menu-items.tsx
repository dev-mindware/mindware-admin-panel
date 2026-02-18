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
      name: "Planos",
      url: "/plans",
      icon: <Icon name="Wallet" />,
    },
    {
      name: "Subscrições",
      url: "/subscriptions",
      icon: <Icon name="Wallet" />,
    },
    {
      name: "Categorias",
      url: "/categories",
      icon: <Icon name="Tag" />,
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
