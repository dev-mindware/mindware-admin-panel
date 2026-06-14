"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Field, FieldContent, FieldError, FieldLabel, GlobalModal, Icon, Input } from "@/components";
import { useUserActions } from "@/hooks/users";
import { resetUserPasswordSchema, type ResetUserPasswordFormData } from "@/schemas/reset-user-password";
import { useModal } from "@/stores";
import type { User } from "@/types";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

export function ResetPasswordModal() {
  const { modalData, closeModal, open } = useModal();
  const user = modalData["reset-user-password"] as User | undefined;
  const isOpen = open["reset-user-password"] || false;
  const { resetPassword, isResettingPassword } = useUserActions();
  const { control, handleSubmit, reset } = useForm<ResetUserPasswordFormData>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: { newPassword: "", passwordConfirmation: "" },
  });

  if (!isOpen || !user) return null;

  const handleClose = () => {
    reset();
    closeModal("reset-user-password");
  };

  const onSubmit = async (data: ResetUserPasswordFormData) => {
    try {
      await resetPassword({ userId: user.id, newPassword: data.newPassword });
      SucessMessage("Palavra-passe redefinida com sucesso");
      handleClose();
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Não foi possível redefinir a palavra-passe");
    }
  };

  return (
    <GlobalModal
      id="reset-user-password"
      title={<span className="flex items-center gap-2"><Icon name="KeyRound" className="size-5 text-primary" />Redefinir palavra-passe</span>}
      description={`Defina uma nova palavra-passe para ${user.name}.`}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button type="submit" form="reset-user-password-form" disabled={isResettingPassword}>
            {isResettingPassword ? "A redefinir..." : "Redefinir palavra-passe"}
          </Button>
        </div>
      }
    >
      <form id="reset-user-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="newPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="new-password">Nova palavra-passe</FieldLabel>
              <FieldContent>
                <Input type="password" id="new-password" placeholder="Mínimo de 8 caracteres" autoComplete="new-password" {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
        <Controller
          name="passwordConfirmation"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password-confirmation">Confirmar palavra-passe</FieldLabel>
              <FieldContent>
                <Input type="password" id="password-confirmation" placeholder="Repita a nova palavra-passe" autoComplete="new-password" {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </form>
    </GlobalModal>
  );
}
