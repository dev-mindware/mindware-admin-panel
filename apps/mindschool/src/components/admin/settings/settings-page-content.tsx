"use client";

import { DefSetup, type DefinitionTab } from "@workspace/ui";
import { AccountPageContent } from "@/components/admin/account/account-page-content";
import { AdminsPageContent } from "@/components/admin/admins/admins-page-content";
import { useMe } from "@/hooks/auth/use-me";

/** Definições: mesmo padrão do MindGest (menu lateral de separadores). A conta e os administradores vivem aqui, não no menu principal. */
export function SettingsPageContent() {
  const { can, permissions } = useMe();
  // enquanto as permissões não chegam, mostra tudo (a API continua a ser a barreira)
  const allowed = (p: string) => permissions.size === 0 || can(p);

  const extraTabs: DefinitionTab[] = [
    { id: "account", label: "A minha conta", icon: "UserRound", category: "general", component: <AccountPageContent embedded /> },
    ...(allowed("platform:admin_manage")
      ? [{ id: "admins", label: "Administradores", icon: "ShieldCheck", category: "workplace", component: <AdminsPageContent embedded /> } satisfies DefinitionTab]
      : []),
  ];

  return <DefSetup disabledTabs={["notifications"]} extraTabs={extraTabs} />;
}
