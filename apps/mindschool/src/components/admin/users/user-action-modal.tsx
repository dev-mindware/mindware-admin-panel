"use client";

import { ReasonModal } from "@workspace/ui";
import { EMAIL_FAILURE_LABEL } from "@/constants/labels";
import { useUserAction } from "@/hooks/directory/use-directory";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import type { AdminUser, EmailActionResult, UserAction } from "@/types/directory";

export const USER_ACTION_MODAL = "user-action";

export const USER_ACTION_LABEL: Record<UserAction, string> = {
  block: "Bloquear utilizador",
  unblock: "Desbloquear utilizador",
  "mfa/reset": "Repor segundo factor",
  "sessions/revoke": "Terminar sessões",
  "password-reset": "Repor palavra-passe",
  "invite/resend": "Reenviar convite",
};

const DONE: Record<UserAction, string> = {
  block: "Utilizador bloqueado.",
  unblock: "Utilizador desbloqueado.",
  "mfa/reset": "Segundo factor reposto: o utilizador tem de o configurar de novo.",
  "sessions/revoke": "Sessões terminadas.",
  "password-reset": "Enviámos ao utilizador um link para repor a palavra-passe.",
  "invite/resend": "Convite reenviado: o link anterior deixou de funcionar.",
};

const HINT: Partial<Record<UserAction, string>> = {
  "password-reset": "O link segue por email para o próprio utilizador: o administrador nunca vê a palavra-passe nem o link.",
  "invite/resend": "O link anterior deixa de funcionar. Só para quem ainda nunca entrou.",
  block: "As sessões do utilizador terminam de imediato.",
  "mfa/reset": "As sessões terminam e o utilizador volta a configurar o autenticador.",
};

interface Target {
  user: AdminUser;
  action: UserAction;
}

/** Acções de suporte sobre um utilizador (todas pedem motivo e reautenticação, e ficam na auditoria). Abre com `openModal("user-action", { user, action })`. */
export function UserActionModal() {
  const act = useUserAction();
  return (
    <ReasonModal<Target>
      id={USER_ACTION_MODAL}
      title={(t) => (t ? USER_ACTION_LABEL[t.action] : "Acção de suporte")}
      description={(t) => (t ? `${USER_ACTION_LABEL[t.action]}: ${t.user.full_name} (${t.user.email}). ${HINT[t.action] ?? ""}` : undefined)}
      withTicket
      destructive
      confirmLabel="Confirmar"
      onConfirm={async ({ reason, ticket }, t) => {
        if (!t) return;
        try {
          const res = (await act.mutateAsync({ id: t.user.id, action: t.action, reason, ...(ticket ? { ticket } : {}) })) as Partial<EmailActionResult>;
          if (res?.sent === false) ErrorMessage(`A acção ficou registada, mas o email não saiu: ${EMAIL_FAILURE_LABEL[res.reason ?? ""] ?? "o envio falhou"}.`);
          else SuccessMessage(DONE[t.action]);
        } catch (e) {
          ErrorMessage(getApiErrorMessage(e, "A operação falhou."));
          throw e;
        }
      }}
    />
  );
}
