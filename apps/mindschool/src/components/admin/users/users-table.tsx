"use client";

import Link from "next/link";
import { Badge, ButtonOnlyAction, FilterToolbar, Icon, StatusBadge, ToneBadge, type Column } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useQueryState } from "nuqs";
import { useDebounce } from "use-debounce";
import { AdminTable } from "@/components/admin/shared/admin-table";
import { USER_STATUS } from "@/constants/statuses";
import { useUsers } from "@/hooks/directory/use-directory";
import { day, ROLE_LABEL } from "@/utils/format";
import type { AdminUser } from "@/types/directory";
import { IMPERSONATE_MODAL, canImpersonate } from "./impersonate-modal";
import { USER_ACTION_LABEL, USER_ACTION_MODAL } from "./user-action-modal";

/**
 * Directório de utilizadores de todas as escolas, com as acções de suporte. Usado na página de Utilizadores e (com `schoolId`) no separador
 * de utilizadores da ficha da escola.
 */
export function UsersTable({ schoolId, embedded = false }: { schoolId?: string; embedded?: boolean }) {
  const [q, setQ] = useQueryState(embedded ? "uq2" : "uq", { defaultValue: "" });
  const [status, setStatus] = useQueryState(embedded ? "ustatus2" : "ustatus", { defaultValue: "" });
  const [dq] = useDebounce(q, 350);
  const list = useUsers({ ...(dq.length >= 2 ? { q: dq } : {}), ...(status ? { status } : {}), ...(schoolId ? { school_id: schoolId } : {}) });
  const { openModal } = useModalStore();
  const act = (user: AdminUser, action: keyof typeof USER_ACTION_LABEL) => openModal(USER_ACTION_MODAL, { user, action });

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "Utilizador",
      render: (_, u) => (
        <div>
          <p className="font-medium">{u.full_name}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Escolas e papéis",
      render: (_, u) =>
        u.memberships.length === 0 ? (
          <span className="text-xs text-muted-foreground">Sem papéis</span>
        ) : (
          <div className="flex max-w-sm flex-wrap gap-1">
            {u.memberships.slice(0, 3).map((m) => (
              <Link key={`${m.school.id}-${m.role}`} href={`/schools/${m.school.id}`}>
                <Badge variant={m.is_active ? "outline" : "secondary"} className="text-[10px]" title={m.is_active ? "" : "Revogado"}>
                  {m.school.name} · {ROLE_LABEL[m.role] ?? m.role}
                </Badge>
              </Link>
            ))}
            {u.memberships.length > 3 && <Badge variant="secondary" className="text-[10px]">+{u.memberships.length - 3}</Badge>}
          </div>
        ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, u) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={u.status} map={USER_STATUS} />
          {u.locked && <ToneBadge tone="warning" label="Bloqueio temporário" className="text-[10px]" />}
          {u.invite_pending && <ToneBadge tone="info" label="Convite pendente" className="text-[10px]" />}
        </div>
      ),
    },
    {
      key: "mfa",
      header: "2FA",
      render: (_, u) => (u.mfa_enabled ? <Badge variant="outline" className="gap-1 text-[10px]"><Icon name="ShieldCheck" className="size-3" />Activo</Badge> : <span className="text-xs text-muted-foreground">—</span>),
    },
    { key: "last", header: "Último acesso", render: (_, u) => <span className="text-xs">{u.last_login_at ? day(u.last_login_at) : "nunca"}</span> },
    {
      key: "actions",
      header: "Acção",
      render: (_, u) => (
        <ButtonOnlyAction
          data={u}
          actions={[
            ...(u.status === "bloqueado" || u.locked ? [{ label: USER_ACTION_LABEL.unblock, icon: "LockOpen" as const, onClick: (x: AdminUser) => act(x, "unblock") }] : []),
            ...(u.status === "activo" && u.invite_pending ? [{ label: USER_ACTION_LABEL["invite/resend"], icon: "Mail" as const, onClick: (x: AdminUser) => act(x, "invite/resend") }] : []),
            ...(u.status === "activo" && !u.invite_pending ? [{ label: USER_ACTION_LABEL["password-reset"], icon: "KeyRound" as const, onClick: (x: AdminUser) => act(x, "password-reset") }] : []),
            ...(u.mfa_enabled ? [{ label: USER_ACTION_LABEL["mfa/reset"], icon: "ShieldOff" as const, onClick: (x: AdminUser) => act(x, "mfa/reset") }] : []),
            ...(canImpersonate(u) ? [{ label: "Personificar", icon: "UserCog" as const, onClick: (x: AdminUser) => openModal(IMPERSONATE_MODAL, x) }] : []),
            { label: USER_ACTION_LABEL["sessions/revoke"], icon: "LogOut" as const, onClick: (x: AdminUser) => act(x, "sessions/revoke") },
            ...(u.status === "activo" ? [{ label: USER_ACTION_LABEL.block, icon: "Ban" as const, variant: "destructive" as const, onClick: (x: AdminUser) => act(x, "block") }] : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterToolbar
        search={{ value: q, onChange: (v) => void setQ(v), placeholder: "Pesquisar por email ou nome (mín. 2 letras)" }}
        filters={[{ key: "status", label: "Estado", value: status, onChange: (v) => void setStatus(v), options: [{ value: "activo", label: "Activos" }, { value: "suspenso", label: "Suspensos" }, { value: "bloqueado", label: "Bloqueados" }] }]}
        onClear={() => {
          void setQ("");
          void setStatus("");
        }}
      />
      <AdminTable list={list} columns={columns} emptyTitle="Sem utilizadores" emptyDescription="Nenhum utilizador corresponde à pesquisa." emptyIcon="Users" />
    </div>
  );
}
