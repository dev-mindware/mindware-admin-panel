"use client";

import { BarListPanel, GaugePanel, MetricGrid, TitleList } from "@workspace/ui";
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
                { title: s.total, subtitle: "Utilizadores", description: `${s.new_30d} novos em 30 dias · ${s.invite_pending} convite(s) pendente(s)`, icon: "Users" },
                { title: s.active_7d, subtitle: "Activos na semana", description: "Entraram nos últimos 7 dias", icon: "Activity" },
                { title: s.privileged_without_mfa, subtitle: "Sem segundo factor", description: "Papéis que o exigem", icon: "ShieldOff", variant: s.privileged_without_mfa > 0 ? "action" : "default", colors: "destructive" },
                { title: s.blocked, subtitle: "Bloqueados", description: `${s.locked} em bloqueio temporário`, icon: "Ban" },
              ]
            : []
        }
        skeletons={4}
      />

      {s && (
        <div className="grid gap-4 md:grid-cols-2">
          <GaugePanel title="Utilizadores activos" description="Entraram nos últimos 7 dias" icon="Activity" percent={s.total ? (s.active_7d / s.total) * 100 : null} caption={`${s.active_7d} de ${s.total}`} />
          <BarListPanel
            title="Pontos de atenção"
            description="Contas que precisam de uma acção de suporte"
            icon="ShieldAlert"
            multicolor
            items={[
              { label: "Sem 2FA", value: s.privileged_without_mfa },
              { label: "Bloqueados", value: s.blocked },
              { label: "Bloqueio temp.", value: s.locked },
              { label: "Convites pend.", value: s.invite_pending },
            ]}
            emptyText="Nenhuma conta precisa de atenção."
          />
        </div>
      )}

      <UsersTable />
      <UserActionModal />
      <ImpersonateModal />
    </div>
  );
}
