"use client";

import { MetricGrid, TitleList } from "@workspace/ui";
import { useUserStats } from "@/hooks/directory/use-directory";
import { ImpersonateModal } from "./impersonate-modal";
import { UserActionModal } from "./user-action-modal";
import { UsersTable } from "./users-table";

/** Utilizadores de todas as escolas: indicadores de acesso e as acções de suporte (resolver «não consigo entrar» sem tocar na base de dados). */
export function UsersPageContent() {
  const stats = useUserStats();
  const s = stats.data;

  return (
    <div className="flex flex-col gap-6">
      <TitleList title="Utilizadores" suTitle="Encontre qualquer utilizador da plataforma e resolva problemas de acesso. Cada acção exige motivo e reautenticação, e fica auditada." />

      <MetricGrid
        isLoading={stats.isLoading}
        isError={stats.isError}
        onRetry={() => void stats.refetch()}
        items={
          s
            ? [
                { title: s.total, subtitle: "Utilizadores", description: `${s.new_30d} novos em 30 dias`, icon: "Users" },
                { title: s.active_7d, subtitle: "Activos na semana", description: "Entraram nos últimos 7 dias", icon: "Activity" },
                { title: s.invite_pending, subtitle: "Convites pendentes", description: "Ainda nunca entraram", icon: "MailPlus", variant: s.invite_pending > 0 ? "action" : "default" },
                { title: s.privileged_without_mfa, subtitle: "Sem segundo factor", description: "Papéis que o exigem", icon: "ShieldOff", variant: s.privileged_without_mfa > 0 ? "action" : "default", colors: "destructive" },
                { title: s.blocked, subtitle: "Bloqueados", description: `${s.locked} em bloqueio temporário`, icon: "Ban" },
              ]
            : []
        }
        skeletons={5}
      />

      <UsersTable />
      <UserActionModal />
      <ImpersonateModal />
    </div>
  );
}
