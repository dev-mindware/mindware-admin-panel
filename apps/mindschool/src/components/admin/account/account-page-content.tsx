"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Button, ConfirmModal, GenericTable, GlobalModal, Icon, Input, ListSkeleton, MetricGrid, Panel, RecoveryCodes, TitleList, TotpSetup, ToneBadge, type Column } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useMe } from "@/hooks/auth/use-me";
import { useAccountActions, useSessions } from "@/hooks/ops/use-ops";
import { useLocalPage } from "@/hooks/use-local-page";
import { BASE_PATH } from "@/constants/routes";
import { getApiErrorMessage } from "@/utils/api-error";
import { dateTime, since } from "@/utils/format";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { UserSession } from "@/types/directory";

const SETUP_MODAL = "totp-setup";
const CODES_MODAL = "recovery-codes";
const NEW_CODES_MODAL = "recovery-new";
const DISABLE_MODAL = "totp-disable";
const END_ALL_MODAL = "sessions-end-all";
const END_ONE_MODAL = "session-end";

/** A minha conta: segundo factor (activar com QR, códigos de recuperação, desactivar) e sessões abertas. */
export function AccountPageContent() {
  const qc = useQueryClient();
  const { me, refetch: refetchMe } = useMe();
  const sessions = useSessions();
  const actions = useAccountActions();
  const { openModal, closeModal } = useModalStore();
  const [secret, setSecret] = useState<{ secret: string; otpauth_url: string } | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [password, setPassword] = useState("");
  const [current, setCurrent] = useState("");
  const rows = (sessions.data ?? []).map((s) => ({ ...s }));
  const page = useLocalPage(rows, 8);

  const showCodes = (c: string[]) => {
    setCodes(c);
    openModal(CODES_MODAL);
  };

  const startSetup = () =>
    actions.enroll.mutate(undefined, {
      onSuccess: (r) => {
        setSecret(r);
        setCode("");
        openModal(SETUP_MODAL);
      },
      onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível iniciar a configuração.")),
    });

  const confirmSetup = (e?: FormEvent) => {
    e?.preventDefault();
    if (code.length < 6) return;
    actions.verify.mutate(code, {
      onSuccess: (r) => {
        SuccessMessage("Autenticador activado.");
        setSecret(null);
        setCode("");
        closeModal(SETUP_MODAL);
        void qc.invalidateQueries({ queryKey: ["me"] });
        void refetchMe();
        if (r.recovery_codes) showCodes(r.recovery_codes);
      },
      onError: (err) => {
        setCode("");
        ErrorMessage(getApiErrorMessage(err, "Código inválido."));
      },
    });
  };

  const columns: Column<UserSession>[] = [
    { key: "device", header: "Dispositivo", render: (_, s) => <div className="flex items-center gap-2"><span className="line-clamp-1 max-w-xs text-sm">{s.user_agent?.slice(0, 70) ?? "Dispositivo"}</span>{s.current && <Badge variant="outline">Esta sessão</Badge>}</div> },
    { key: "ip", header: "IP", render: (_, s) => <span className="font-mono text-xs">{s.ip ?? "—"}</span> },
    { key: "started", header: "Iniciada", render: (_, s) => <span className="text-xs">{dateTime(s.started_at)}</span> },
    { key: "last", header: "Última actividade", render: (_, s) => <span className="text-xs">{since(s.last_active_at)}</span> },
    { key: "a", header: "Acção", render: (_, s) => (s.current ? null : <Button size="sm" variant="outline" onClick={() => openModal(END_ONE_MODAL, s)}>Terminar</Button>) },
  ];

  const mfaOn = Boolean(me?.mfa_enabled);

  return (
    <div className="flex flex-col gap-6">
      <TitleList title="A minha conta" suTitle="Proteja o seu acesso de administrador: segundo factor, códigos de recuperação e sessões abertas." />

      <MetricGrid
        isLoading={!me}
        items={[
          { title: me?.full_name ?? "—", subtitle: "Administrador", description: me?.email, icon: "UserRound" },
          { title: mfaOn ? "Activo" : "Por activar", subtitle: "Segundo factor", description: mfaOn ? "Autenticador ligado" : "Recomendado e exigido em produção", icon: mfaOn ? "ShieldCheck" : "ShieldOff", variant: mfaOn ? "default" : "action", colors: "destructive" },
          { title: sessions.data?.length ?? "—", subtitle: "Sessões abertas", description: "Dispositivos com sessão iniciada", icon: "Monitor" },
          { title: "Plataforma", subtitle: "Papel", description: "Administrador de sistema", icon: "Crown" },
        ]}
      />

      <Panel title="Autenticação em dois passos" description="Além da palavra-passe, pede um código de 6 dígitos gerado no telemóvel." icon="Smartphone" action={<ToneBadge tone={mfaOn ? "success" : "warning"} label={mfaOn ? "Segundo factor activo" : "Sem segundo factor"} />}>
        {me?.mfa_enrollment_required && !mfaOn && (
          <div className="mb-3 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
            <Icon name="ShieldAlert" className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>O seu perfil exige o segundo factor. Leva um minuto: clique em «Configurar autenticador» e siga os três passos.</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {!mfaOn ? (
            <Button className="gap-2" loading={actions.enroll.isPending} onClick={startSetup}><Icon name="ShieldCheck" className="size-4" />Configurar autenticador</Button>
          ) : (
            <>
              <Button variant="outline" className="gap-2" onClick={() => { setCurrent(""); openModal(NEW_CODES_MODAL); }}><Icon name="KeyRound" className="size-4" />Novos códigos de recuperação</Button>
              <Button variant="outline" className="gap-2 text-destructive" onClick={() => { setPassword(""); setCurrent(""); openModal(DISABLE_MODAL); }}><Icon name="ShieldOff" className="size-4" />Desactivar</Button>
            </>
          )}
        </div>
      </Panel>

      <Panel title="Sessões abertas" icon="Monitor" action={<Button size="sm" variant="outline" className="gap-2 text-destructive" onClick={() => openModal(END_ALL_MODAL)}><Icon name="LogOut" className="size-4" />Terminar todas</Button>}>
        {sessions.isLoading ? <ListSkeleton cols={5} rows={3} /> : (
          <GenericTable<UserSession> data={page.rows} columns={columns} page={page.page} total={page.total} totalPages={page.totalPages} setPage={page.setPage} goToNextPage={page.goToNextPage} goToPreviousPage={page.goToPreviousPage} emptyTitle="Sem sessões" emptyDescription="Não há sessões abertas." emptyIcon="Monitor" />
        )}
      </Panel>

      <GlobalModal
        id={SETUP_MODAL}
        size="md"
        title="Configurar autenticador"
        description="Três passos rápidos: instalar, ler o código QR e confirmar."
        footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => closeModal(SETUP_MODAL)}>Cancelar</Button><Button disabled={code.length < 6} loading={actions.verify.isPending} onClick={() => confirmSetup()}>Activar</Button></div>}
      >
        {secret && (
          <form onSubmit={confirmSetup}>
            <TotpSetup secret={secret} code={code} onCode={setCode} busy={actions.verify.isPending} />
          </form>
        )}
      </GlobalModal>

      <GlobalModal id={CODES_MODAL} title="Códigos de recuperação" description="Guarde-os agora num local seguro." footer={<div className="flex justify-end"><Button onClick={() => closeModal(CODES_MODAL)}>Já guardei</Button></div>}>
        <RecoveryCodes codes={codes ?? []} />
      </GlobalModal>

      <GlobalModal
        id={NEW_CODES_MODAL}
        title="Novos códigos de recuperação"
        description="Os códigos anteriores deixam de funcionar. Confirme com o código actual do autenticador."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => closeModal(NEW_CODES_MODAL)}>Cancelar</Button>
            <Button
              disabled={current.trim().length < 6}
              loading={actions.recovery.isPending}
              onClick={() =>
                actions.recovery.mutate(current.trim(), {
                  onSuccess: (r) => { closeModal(NEW_CODES_MODAL); SuccessMessage("Novos códigos gerados."); showCodes(r.recovery_codes); },
                  onError: (e) => ErrorMessage(getApiErrorMessage(e, "Código inválido.")),
                })
              }
            >
              Gerar códigos
            </Button>
          </div>
        }
      >
        <Input label="Código actual *" inputMode="numeric" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </GlobalModal>

      <GlobalModal
        id={DISABLE_MODAL}
        title="Desactivar segundo factor"
        description="A conta fica protegida apenas pela palavra-passe."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => closeModal(DISABLE_MODAL)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={!password || current.trim().length < 6}
              loading={actions.disable.isPending}
              onClick={() =>
                actions.disable.mutate({ password, code: current.trim() }, {
                  onSuccess: () => { closeModal(DISABLE_MODAL); SuccessMessage("Segundo factor desactivado."); void qc.invalidateQueries({ queryKey: ["me"] }); },
                  onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível desactivar.")),
                })
              }
            >
              Desactivar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Palavra-passe *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="Código actual *" inputMode="numeric" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
      </GlobalModal>

      <ConfirmModal<UserSession>
        id={END_ONE_MODAL}
        title="Terminar sessão"
        description="O dispositivo escolhido perde o acesso de imediato."
        destructive
        confirmLabel="Terminar"
        onConfirm={async (s) => {
          if (!s) return;
          try {
            await actions.revoke.mutateAsync(s.id);
            SuccessMessage("Sessão terminada.");
          } catch (e) {
            ErrorMessage(getApiErrorMessage(e, "Não foi possível terminar a sessão."));
            throw e;
          }
        }}
      />
      <ConfirmModal
        id={END_ALL_MODAL}
        title="Terminar todas as sessões"
        description="Todas as sessões, incluindo esta, serão terminadas e terá de iniciar sessão novamente."
        destructive
        confirmLabel="Terminar todas"
        onConfirm={async () => {
          try {
            await actions.logoutAll.mutateAsync();
            window.location.replace(`${BASE_PATH}/auth/login`);
          } catch (e) {
            ErrorMessage(getApiErrorMessage(e, "Não foi possível terminar as sessões."));
            throw e;
          }
        }}
      />
    </div>
  );
}
