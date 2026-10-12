"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button, FormSection, GlobalModal, Icon, Input, SelectField } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { EMAIL_FAILURE_LABEL, SUBSYSTEM_LABEL } from "@/constants/labels";
import { useOnboard } from "@/hooks/directory/use-directory";
import { onboardSchema, type OnboardFormData } from "@/schemas/school";
import { getApiErrorMessage } from "@/utils/api-error";
import { maskNif, maskPhone } from "@/utils/masks";
import { ErrorMessage } from "@/utils/messages";
import type { OnboardResult } from "@/services/directory-service";
import type { AdminSchool } from "@/types/directory";

export const ONBOARD_MODAL = "onboard-school";

const DEFAULTS: OnboardFormData = { name: "", nif: "", subsystem: "geral", med: "", phone: "", email: "", address: "", trial: "14", titularName: "", titularEmail: "" };

/**
 * Assistente «Nova escola»: escola + período de teste + Titular numa só chamada atómica.
 * O Titular não recebe palavra-passe do painel: a conta nasce sem palavra-passe utilizável e o convite por email (só enviado depois de tudo
 * confirmado) traz a ligação para ele a definir a sua. Um email que já tem conta reutiliza-se, sem novo convite.
 */
function OnboardDialog() {
  const { closeModal } = useModalStore();
  const onboard = useOnboard();
  const [result, setResult] = useState<OnboardResult | null>(null);
  const {
    control, handleSubmit, formState: { errors, isValid },
  } = useForm<OnboardFormData>({ resolver: zodResolver(onboardSchema), defaultValues: DEFAULTS, mode: "onChange" });

  const onSubmit = (f: OnboardFormData) =>
    onboard.mutate(
      {
        name: f.name.trim(), nif: f.nif.trim(), subsystem: f.subsystem as AdminSchool["subsystem"],
        ...(f.med?.trim() ? { medCode: f.med.trim() } : {}), ...(f.phone?.trim() ? { phone: f.phone.trim() } : {}), ...(f.email?.trim() ? { email: f.email.trim() } : {}),
        ...(f.address?.trim() ? { address: f.address.trim() } : {}), trialDays: Number(f.trial) || 14, titularName: f.titularName.trim(), titularEmail: f.titularEmail.trim().toLowerCase(),
      },
      { onSuccess: setResult, onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível criar a escola.")) },
    );

  return (
    <GlobalModal
      id={ONBOARD_MODAL}
      size="lg"
      title={<span className="flex items-center gap-2"><Icon name="School" className="size-5 text-primary" />Nova escola</span>}
      description="Cria a escola, o período de teste e o Titular de uma só vez. O Titular recebe um convite por email para definir a sua palavra-passe."
    >
      {result ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-500/15 text-green-600"><Icon name="CircleCheck" className="size-7" /></div>
          <p className="text-sm"><strong>{result.school.name}</strong> foi criada.</p>
          <p className="text-sm text-muted-foreground">
            {result.titular.invite === null
              ? `${result.titular.email} já tinha conta: passa a Titular desta escola (sem novo convite).`
              : result.titular.invite.sent
                ? `Enviámos o convite a ${result.titular.email}. O link serve para definir a palavra-passe e entrar.`
                : `A escola ficou criada, mas o convite não saiu (${EMAIL_FAILURE_LABEL[result.titular.invite.reason] ?? "o envio falhou"}). Reenvie-o em Utilizadores.`}
          </p>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => closeModal(ONBOARD_MODAL)}>Fechar</Button>
            <Button asChild><Link href={`/schools/${result.school.id}`} onClick={() => closeModal(ONBOARD_MODAL)}>Abrir a ficha da escola</Link></Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormSection step={1} title="Escola" description="Os dados legais da escola. O NIF identifica a escola nos documentos emitidos.">
            <div className="sm:col-span-2">
              <Controller name="name" control={control} render={({ field }) => (
                <Input label="Nome da escola *" placeholder="Ex.: Colégio Horizonte Azul" error={errors.name?.message} {...field} />
              )} />
            </div>
            <Controller name="nif" control={control} render={({ field }) => (
              <Input label="NIF *" placeholder="Ex.: 5417000000" inputMode="text" error={errors.nif?.message} hint="Número de Identificação Fiscal da escola." {...field} onChange={(e) => field.onChange(maskNif(e.target.value))} />
            )} />
            <Controller name="subsystem" control={control} render={({ field }) => (
              <SelectField label="Subsistema de ensino *" value={field.value} options={Object.entries(SUBSYSTEM_LABEL).map(([value, label]) => ({ value, label }))} onValueChange={field.onChange} hint="Define as regras académicas aplicadas à escola." />
            )} />
            <Controller name="med" control={control} render={({ field }) => (
              <Input label="Código MED" placeholder="Opcional" error={errors.med?.message} hint="Código atribuído pelo Ministério da Educação, se existir." {...field} />
            )} />
            <Controller name="phone" control={control} render={({ field }) => (
              <Input label="Telefone" inputMode="tel" placeholder="+244 923 456 789" error={errors.phone?.message} {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
            )} />
            <Controller name="email" control={control} render={({ field }) => (
              <Input label="Email da escola" type="email" placeholder="secretaria@escola.ao" error={errors.email?.message} {...field} />
            )} />
            <Controller name="address" control={control} render={({ field }) => (
              <Input label="Morada" placeholder="Rua, bairro, município, província" error={errors.address?.message} {...field} />
            )} />
          </FormSection>

          <FormSection step={2} title="Período de teste" description="A escola usa o sistema grátis durante este período; depois tem de subscrever um plano." columns={1}>
            <Controller name="trial" control={control} render={({ field }) => (
              <SelectField label="Duração do teste" value={field.value} options={["7", "14", "30", "60", "90"].map((v) => ({ value: v, label: `${v} dias` }))} onValueChange={field.onChange} />
            )} />
          </FormSection>

          <FormSection step={3} title="Titular da escola" description="A pessoa responsável pela escola no sistema. Pode convidar a restante equipa depois de entrar.">
            <Controller name="titularName" control={control} render={({ field }) => (
              <Input label="Nome completo *" placeholder="Ex.: Maria da Conceição Santos" autoComplete="off" error={errors.titularName?.message} {...field} />
            )} />
            <Controller name="titularEmail" control={control} render={({ field }) => (
              <Input label="Email *" type="email" placeholder="titular@escola.ao" autoComplete="off" error={errors.titularEmail?.message} {...field} onChange={(e) => field.onChange(e.target.value.trim().toLowerCase())} />
            )} />
            <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground sm:col-span-2">
              <Icon name="MailCheck" className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                Não se define palavra-passe aqui. O Titular recebe um email com um link de uso único (válido por tempo limitado) para criar a sua própria palavra-passe.
                Se o email já tiver conta, passa a Titular desta escola sem novo convite.
              </p>
            </div>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => closeModal(ONBOARD_MODAL)}>Cancelar</Button>
            <Button type="submit" disabled={!isValid} loading={onboard.isPending}>
              <Icon name="Save" className="mr-2 size-4" />
              Criar escola
            </Button>
          </div>
        </form>
      )}
    </GlobalModal>
  );
}

/** Abre com `openModal("onboard-school")`; o formulário é montado de novo a cada abertura (nasce vazio). */
export function OnboardModal() {
  const { open } = useModalStore();
  return open[ONBOARD_MODAL] ? <OnboardDialog /> : null;
}
