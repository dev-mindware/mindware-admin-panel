"use client";

import { useState } from "react";
import { Button, GlobalModal, Icon, SelectField, Textarea } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useImpersonationActions } from "@/hooks/directory/use-directory";
import { BASE_PATH } from "@/constants/routes";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage } from "@/utils/messages";
import type { AdminUser } from "@/types/directory";

export const IMPERSONATE_MODAL = "impersonate";

/** Só se personifica quem está activo, tem papel numa escola e não é administrador de sistema. */
export const canImpersonate = (u: AdminUser) => u.status === "activo" && u.memberships.some((m) => m.is_active) && !u.memberships.some((m) => m.role === "admin_sistema");

const SCHOOL_APP = process.env.NEXT_PUBLIC_SCHOOL_APP_URL ?? "http://localhost:3001";

function ImpersonateDialog({ user }: { user: AdminUser }) {
  const { closeModal } = useModalStore();
  const { start } = useImpersonationActions();
  const schools = [...new Map(user.memberships.filter((m) => m.is_active).map((m) => [m.school.id, m.school])).values()];
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? "");
  const [mode, setMode] = useState<"leitura" | "escrita">("leitura");
  const [minutes, setMinutes] = useState("15");
  const [reason, setReason] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const valid = Boolean(schoolId) && reason.trim().length >= 10;

  const submit = () =>
    start.mutate(
      { targetUserId: user.id, schoolId, reason: reason.trim(), durationMinutes: Number(minutes), mode },
      {
        onSuccess: (r) => {
          const back = encodeURIComponent(`${window.location.origin}${BASE_PATH}/impersonations`);
          setLink(`${SCHOOL_APP}/auth/impersonar?code=${encodeURIComponent(r.handoff.code)}&return=${back}`);
        },
        onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível iniciar a personificação.")),
      },
    );

  return (
    <GlobalModal
      id={IMPERSONATE_MODAL}
      title="Personificar utilizador"
      description={`Vai ver o sistema como ${user.full_name} (${user.email}). O Titular da escola é avisado por email e tudo fica registado com o seu nome.`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => closeModal(IMPERSONATE_MODAL)}>{link ? "Fechar" : "Cancelar"}</Button>
          {!link && <Button disabled={!valid} loading={start.isPending} onClick={submit}>Iniciar personificação</Button>}
        </div>
      }
    >
      {link ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-500/15 text-green-600"><Icon name="UserCheck" className="size-7" /></div>
          <p className="text-sm">Personificação pronta. O código vale <strong>60 segundos</strong> e só pode ser usado uma vez.</p>
          <Button asChild className="gap-2">
            <a href={link} target="_blank" rel="noreferrer"><Icon name="ExternalLink" className="size-4" />Abrir como {user.full_name}</a>
          </Button>
          <p className="text-xs text-muted-foreground">Abre no frontend da escola, com a faixa «A actuar como…». Para terminar, use o botão da faixa.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Escola" value={schoolId} options={schools.map((s) => ({ value: s.id, label: s.name }))} onValueChange={setSchoolId} />
            <SelectField label="Duração" value={minutes} options={[5, 10, 15, 20, 30].map((m) => ({ value: String(m), label: `${m} minutos` }))} onValueChange={setMinutes} />
          </div>
          <SelectField
            label="Modo"
            value={mode}
            options={[
              { value: "leitura", label: "Só leitura (recomendado): consulta, não altera nada" },
              { value: "escrita", label: "Leitura e escrita: pode alterar dados (excepto operações de alto risco)" },
            ]}
            onValueChange={(v) => setMode(v as "leitura" | "escrita")}
          />
          <Textarea label="Motivo * (mínimo 10 caracteres)" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: Pedido #1234, a secretaria não consegue importar alunos." />
        </div>
      )}
    </GlobalModal>
  );
}

/**
 * Assume temporariamente a identidade de um utilizador (suporte). O painel e o frontend da escola estão em domínios diferentes:
 * a API devolve só um código de uso único (60 s) e é o frontend da escola que o troca pelo token e mostra a faixa «A actuar como…».
 * Salvaguardas: só leitura por omissão, 30 minutos no máximo, motivo, reautenticação, auditoria e email ao Titular. Abre com `openModal("impersonate", user)`.
 */
export function ImpersonateModal() {
  const { open, modalData } = useModalStore();
  const user = modalData[IMPERSONATE_MODAL] as AdminUser | undefined;
  if (!open[IMPERSONATE_MODAL] || !user) return null;
  return <ImpersonateDialog key={user.id} user={user} />;
}
