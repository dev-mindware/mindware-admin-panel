import type { icons } from "lucide-react";

export type MenuItem = {
  name: string;
  url: string;
  icon: keyof typeof icons;
  /** Permissão da API que dá acesso à página (qualquer uma). Sem ela, a página é visível a todo o administrador. */
  permissions?: readonly string[];
};

/**
 * Menu plano (sem colapsáveis): 11 páginas, sempre visíveis, na ordem do trabalho diário. A sidebar esconde as páginas cuja permissão
 * `platform:*` o administrador não tem (a API continua a ser a barreira).
 */
export const adminMenuItems: MenuItem[] = [
  { name: "Dashboard", url: "/dashboard", icon: "LayoutDashboard", permissions: ["platform:overview"] },
  { name: "Subscrições", url: "/subscriptions", icon: "Wallet", permissions: ["platform:subscription_review"] },
  { name: "Escolas", url: "/schools", icon: "School", permissions: ["platform:school_read"] },
  { name: "Utilizadores", url: "/users", icon: "Users", permissions: ["platform:user_support"] },
  { name: "Planos e extras", url: "/plans", icon: "Package", permissions: ["platform:plan_manage"] },
  { name: "Cupões", url: "/coupons", icon: "Ticket", permissions: ["platform:coupon_manage"] },
  { name: "Personificações", url: "/impersonations", icon: "UserCog", permissions: ["platform:impersonate"] },
  { name: "Segurança", url: "/security", icon: "ShieldAlert", permissions: ["platform:security_alerts", "platform:audit_read"] },
  { name: "Operações", url: "/operations", icon: "Activity", permissions: ["platform:outbox_manage", "platform:overview"] },
  { name: "Comunicação", url: "/communication", icon: "Mail", permissions: ["platform:email"] },
  { name: "Administradores", url: "/admins", icon: "ShieldCheck", permissions: ["platform:admin_manage"] },
  { name: "A minha conta", url: "/account", icon: "UserRound" },
];
