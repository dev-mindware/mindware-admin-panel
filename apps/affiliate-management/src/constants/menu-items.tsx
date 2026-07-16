import { Icon } from "@/components";

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

export const adminMenuItems: MenuStructure = {
  items: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: <Icon name="LayoutDashboard" />,
    },
    {
      name: "Afiliados",
      url: "/affiliates",
      icon: <Icon name="Users" />,
    },
    {
      name: "Planos",
      url: "/plans",
      icon: <Icon name="Layers" />,
    },
    {
      name: "Subscrições",
      url: "/subscriptions",
      icon: <Icon name="CreditCard" />,
    },
    {
      name: "Comissões",
      url: "/commissions",
      icon: <Icon name="BadgeDollarSign" />,
    },
    {
      name: "Pagamentos",
      url: "/withdrawals",
      icon: <Icon name="Wallet" />,
    },
    {
      name: "Configurações",
      url: "/definitions",
      icon: <Icon name="Settings" />,
    },
  ],
};

export const affiliateMenuItems: MenuStructure = {
  items: [
    {
      name: "Painel",
      url: "/dashboard",
      icon: <Icon name="LayoutDashboard" />,
    },
    {
      name: "Meus Leads",
      url: "/leads",
      icon: <Icon name="Bell" />,
    },
    {
      name: "Minhas Comissões",
      url: "/commissions",
      icon: <Icon name="BadgeDollarSign" />,
    },
    {
      name: "Carteira",
      url: "/wallet",
      icon: <Icon name="Wallet" />,
    },
    {
      name: "Perfil",
      url: "/profile",
      icon: <Icon name="Settings" />,
    },
  ],
};
