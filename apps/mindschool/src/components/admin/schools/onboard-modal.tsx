"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, GlobalModal, Icon, Input, SelectField } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { EMAIL_FAILURE_LABEL, SUBSYSTEM_LABEL } from "@/constants/labels";
import { useOnboard } from "@/hooks/directory/use-directory";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage } from "@/utils/messages";
import type { OnboardResult } from "@/services/directory-service";
import type { AdminSchool } from "@/types/directory";

export const ONBOARD_MODAL = "onboard-school";

const EMPTY = { name: "", nif: "", subsystem: "geral", prefix: "", med: "", phone: "", email: "", address: "", trial: "14", titularName: "", titularEmail: "" };

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-xs text-primary">{n}</span>
        {title}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/**
 * Assistente «Nova escola»: escola + período de teste + Titular numa só chamada atómica. O Titular novo recebe o convite por email
 * (só depois de tudo estar confirmado); um email que já tem conta reutiliza-se sem novo convite.
 */
function OnboardDialog() {
  const { closeModal } = useModalStore();
  const onboard = useOnboard();
  const [f, setF] = useState(EMPTY);
  const [result, setResult] = useState<OnboardResult | null>(null);
  const set = (k: keyof typeof EMPTY) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const valid = f.name.trim().length >= 3 && f.nif.trim().length >= 5 && f.prefix.trim().length >= 2 && f.titularName.trim().length >= 3 && /^\S+@\S+\.\S+$/.test(f.titularEmail.trim());

  const submit = () =>
    onboard.mutate(
      {
        name: f.name.trim(), nif: f.nif.trim(), subsystem: f.subsystem as AdminSchool["subsystem"], fiscalSeriesPrefix: f.prefix.trim().toUpperCase(),
        ...(f.med.trim() ? { medCode: f.med.trim() } : {}), ...(f.phone.trim() ? { phone: f.phone.trim() } : {}), ...(f.email.trim() ? { email: f.email.trim() } : {}),
        ...(f.address.trim() ? { address: f.address.trim() } : {}), trialDays: Number(f.trial) || 14, titularName: f.titularName.trim(), titularEmail: f.titularEmail.trim().toLowerCase(),
      },
      { onSuccess: setResult, onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível criar a escola.")) },
    );

  return (
    <GlobalModal
      id={ONBOARD_MODAL}
      size="lg"
      title="Nova escola"
      description="Cria a escola, o período de teste e o Titular de uma só vez. O Titular recebe o convite por email."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => closeModal(ONBOARD_MODAL)}>{result ? "Fechar" : "Cancelar"}</Button>
          {!result && <Button disabled={!valid} loading={onboard.isPending} onClick={submit}>Criar escola</Button>}
        </div>
      }
    >
      {result ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-500/15 text-green-600"><Icon name="CircleCheck" className="size-7" /></div>
          <p className="text-sm"><strong>{result.school.name}</strong> foi criada.</p>
          <p className="text-sm text-muted-foreground">
            {result.titular.invite === null
              ? `${result.titular.email} já tinha conta: passa a Titular desta escola (sem novo convite).`
              : result.titular.invite.sent
                ? `Enviámos o convite a ${result.titular.email}.`
                : `A escola ficou criada, mas o convite não saiu (${EMAIL_FAILURE_LABEL[result.titular.invite.reason] ?? "o envio falhou"}). Reenvie-o em Utilizadores.`}
          </p>
          <Button asChild variant="outline"><Link href={`/schools/${result.school.id}`} onClick={() => closeModal(ONBOARD_MODAL)}>Abrir a ficha da escola</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Section n={1} title="Escola">
            <Input label="Nome *" value={f.name} onChange={(e) => set("name")(e.target.value)} />
            <Input label="NIF *" value={f.nif} onChange={(e) => set("nif")(e.target.value)} />
            <SelectField label="Subsistema" value={f.subsystem} options={Object.entries(SUBSYSTEM_LABEL).map(([value, label]) => ({ value, label }))} onValueChange={set("subsystem")} />
            <Input label="Prefixo das séries fiscais *" placeholder="ex.: CHZ" value={f.prefix} onChange={(e) => set("prefix")(e.target.value.toUpperCase())} />
            <Input label="Código MED" value={f.med} onChange={(e) => set("med")(e.target.value)} />
            <Input label="Telefone" value={f.phone} onChange={(e) => set("phone")(e.target.value)} />
            <Input label="Email da escola" value={f.email} onChange={(e) => set("email")(e.target.value)} />
            <Input label="Morada" value={f.address} onChange={(e) => set("address")(e.target.value)} />
          </Section>
          <Section n={2} title="Período de teste">
            <SelectField label="Duração do teste" value={f.trial} options={["7", "14", "30", "60", "90"].map((v) => ({ value: v, label: `${v} dias` }))} onValueChange={set("trial")} />
          </Section>
          <Section n={3} title="Titular da escola">
            <Input label="Nome completo *" value={f.titularName} onChange={(e) => set("titularName")(e.target.value)} />
            <Input label="Email *" type="email" value={f.titularEmail} onChange={(e) => set("titularEmail")(e.target.value)} />
          </Section>
        </div>
      )}
    </GlobalModal>
  );
}

/** Abre com `openModal("onboard-school")`; o formulário é montado de novo a cada abertura (nasce vazio). */
export function OnboardModal() {
  const { open } = useModalStore();
  return open[ONBOARD_MODAL] ? <OnboardDialog /> : null;
}
