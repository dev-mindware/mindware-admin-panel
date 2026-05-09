import {
  LayoutDashboard,
  Users,
  Bell,
  Wallet,
  Settings,
  ShieldCheck,
  FileText,
  BadgeDollarSign,
} from "lucide-react";

export const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Afiliados",
    url: "/affiliates",
    icon: Users,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Bell,
  },
  {
    title: "Comissões",
    url: "/commissions",
    icon: BadgeDollarSign,
  },
  {
    title: "Pagamentos",
    url: "/withdrawals",
    icon: Wallet,
  },
  {
    title: "Serviços",
    url: "/services",
    icon: FileText,
  },
  {
    title: "Configurações",
    url: "/definitions",
    icon: Settings,
  },
];

export const affiliateMenuItems = [
  {
    title: "Painel",
    url: "/affiliate/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Meus Leads",
    url: "/affiliate/leads",
    icon: Bell,
  },
  {
    title: "Minhas Comissões",
    url: "/affiliate/commissions",
    icon: BadgeDollarSign,
  },
  {
    title: "Carteira",
    url: "/affiliate/wallet",
    icon: Wallet,
  },
  {
    title: "Perfil",
    url: "/affiliate/profile",
    icon: Settings,
  },
];
