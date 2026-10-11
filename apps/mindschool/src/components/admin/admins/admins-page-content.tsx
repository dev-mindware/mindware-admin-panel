"use client";

import { Button, ButtonOnlyAction, GaugePanel, GenericTable, Icon, Input, ListSkeleton, MetricGrid, ReasonModal, TitleList, ToneBadge, type Column } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useEffect, useRef, useState } from "react";
import { EMAIL_FAILURE_LABEL } from "@/constants/labels";
import { useAdminActions, useAdmins } from "@/hooks/directory/use-directory";
import { useLocalPage } from "@/hooks/use-local-page";
import { getApiErrorMessage } from "@/utils/api-error";
import { day } from "@/utils/format";
import { ErrorMessage, SuccessMessage, WarningMessage } from "@/utils/messages";
import type { AdminAdmin } from "@/types/directory";

type Row = AdminAdmin & { id: string };

const INVITE_MODAL = "admin-invite";
const REVOKE_MODAL = "admin-revoke";

function InviteFields({ onDraft }: { onDraft: (d: { email: string; name: string }) => void }) {
  const [d, setD] = useState({ email: "", name: "" });
  useEffect(() => {
    onDraft(d);
  });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Nome completo *" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
      <Input label="Email *" type="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} />
      <p className="text-xs text-muted-foreground sm:col-span-2">Só se convidam contas novas, exclusivas da plataforma. O convite define a palavra-passe pelo link; o segundo factor é obrigatório no primeiro acesso.</p>
    </div>
  );
}

/** Quem administra a plataforma: convidar novos administradores, ver o estado do 2FA e revogar acessos (nunca o próprio nem o último). */
export function AdminsPageContent({ embedded }: { embedded?: boolean } = {}) {
  const q = useAdmins();
  const { invite, revoke } = useAdminActions();
  const { openModal } = useModalStore();
  const draft = useRef({ email: "", name: "" });
  const all = q.data ?? [];
  const page = useLocalPage(
    all.map((a): Row => ({ ...a, id: a.user_id })),
    10,
  );

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Administrador",
      render: (_, a) => (
        <div>
          <p className="font-medium">{a.full_name}{a.is_self && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}</p>
          <p className="text-xs text-muted-foreground">{a.email}</p>
        </div>
      ),
    },
    { key: "mfa", header: "2FA", render: (_, a) => <ToneBadge tone={a.mfa_enabled ? "success" : "warning"} label={a.mfa_enabled ? "Activo" : "Por activar"} /> },
    { key: "state", header: "Estado", render: (_, a) => (a.invite_pending ? <ToneBadge tone="info" label="Convite pendente" /> : <ToneBadge tone={a.status === "activo" ? "success" : "danger"} label={a.status === "activo" ? "Activo" : a.status} />) },
    { key: "last", header: "Último acesso", render: (_, a) => <span className="text-xs">{a.last_login_at ? day(a.last_login_at) : "nunca"}</span> },
    { key: "granted", header: "Desde", render: (_, a) => <span className="text-xs text-muted-foreground">{day(a.granted_at)}</span> },
    { key: "actions", header: "Acção", render: (_, a) => (a.is_self ? null : <ButtonOnlyAction data={a} actions={[{ label: "Revogar acesso", icon: "UserMinus", variant: "destructive", onClick: (x) => openModal(REVOKE_MODAL, x) }]} />) },
  ];

  return (
    <div className="flex flex-col gap-6">
      {embedded ? (
        <div className="flex justify-end">
          <Button size="sm" className="gap-2" onClick={() => openModal(INVITE_MODAL)}>
            <Icon name="UserPlus" className="size-4" />
            Convidar administrador
          </Button>
        </div>
      ) : (
        <TitleList title="Administradores" suTitle="Quem pode administrar a plataforma. Cada convite e cada revogação exigem motivo e reautenticação, e ficam na auditoria.">
          <Button size="sm" className="gap-2" onClick={() => openModal(INVITE_MODAL)}>
          <Icon name="UserPlus" className="size-4" />
          Convidar administrador
        </Button>
        </TitleList>
      )}

      <MetricGrid
        isLoading={q.isLoading}
        isError={q.isError}
        onRetry={() => void q.refetch()}
        items={[
          { title: all.length, subtitle: "Administradores", description: "Com acesso à plataforma", icon: "ShieldCheck" },
          { title: all.filter((a) => a.mfa_enabled).length, subtitle: "Com 2FA activo", description: `${all.filter((a) => !a.mfa_enabled).length} por activar`, icon: "ShieldCheck", variant: all.some((a) => !a.mfa_enabled) ? "action" : "default", colors: "destructive" },
          { title: all.filter((a) => a.invite_pending).length, subtitle: "Convites pendentes", description: "Ainda não entraram", icon: "MailPlus" },
          { title: all.filter((a) => a.last_login_at && Date.now() - new Date(a.last_login_at).getTime() < 7 * 86_400_000).length, subtitle: "Activos na semana", description: "Entraram nos últimos 7 dias", icon: "Activity" },
        ]}
      />

      {!q.isLoading && all.length > 0 && (
        <GaugePanel title="Cobertura de 2FA" description="Administradores com segundo factor activo" icon="ShieldCheck" percent={(all.filter((a) => a.mfa_enabled).length / all.length) * 100} caption={`${all.filter((a) => a.mfa_enabled).length} de ${all.length}`} warnBelow={100} className="max-w-md" />
      )}

      {q.isLoading ? <ListSkeleton cols={5} rows={3} /> : (
        <GenericTable<Row> data={page.rows} columns={columns} page={page.page} total={page.total} totalPages={page.totalPages} setPage={page.setPage} goToNextPage={page.goToNextPage} goToPreviousPage={page.goToPreviousPage} emptyTitle="Sem administradores" emptyDescription="Não há administradores activos." emptyIcon="ShieldCheck" />
      )}

      <ReasonModal
        id={INVITE_MODAL}
        title="Convidar administrador"
        description="Cria uma conta nova de administrador de sistema e envia o convite por email."
        confirmLabel="Convidar"
        onConfirm={async ({ reason }) => {
          const d = draft.current;
          try {
            if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email.trim())) throw new Error("Indique o nome e um email válido.");
            const r = await invite.mutateAsync({ email: d.email.trim().toLowerCase(), fullName: d.name.trim(), reason });
            if (r.invite.sent) SuccessMessage(`Convite enviado a ${r.email}.`);
            else WarningMessage(`Conta criada, mas o convite não saiu (${EMAIL_FAILURE_LABEL[r.invite.reason ?? ""] ?? "o envio falhou"}). Reenvie-o em Utilizadores.`);
          } catch (e) {
            ErrorMessage(getApiErrorMessage(e, "Não foi possível convidar."));
            throw e;
          }
        }}
      >
        {() => <InviteFields onDraft={(d) => { draft.current = d; }} />}
      </ReasonModal>

      <ReasonModal<Row>
        id={REVOKE_MODAL}
        title="Revogar acesso de administrador"
        description={(a) => (a ? `${a.full_name} (${a.email}) deixa de poder administrar a plataforma e as sessões terminam de imediato.` : undefined)}
        destructive
        confirmLabel="Revogar"
        onConfirm={async ({ reason }, a) => {
          if (!a) return;
          try {
            await revoke.mutateAsync({ userId: a.user_id, reason });
            SuccessMessage("Acesso revogado.");
          } catch (e) {
            ErrorMessage(getApiErrorMessage(e, "Não foi possível revogar."));
            throw e;
          }
        }}
      />
    </div>
  );
}
