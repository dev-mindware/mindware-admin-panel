"use client";
import Logo from "@/assets/brand.png";
import { ButtonSubmit, Input } from "@/components";
import { ForgotPasswordFormData } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/schemas";
import { ErrorMessage } from "@/utils/messages";
import { AuthHeader, BackToLogin } from "../_components";
import { cn } from "@/lib";
import Image from "next/image";
import { useState } from "react";
import { authService } from "@/services/auth-service";

export function RecoveryPassword() {
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      const res = await authService.forgotPassword(data.email);
      setMessage(res.message);
    } catch (error) {
      ErrorMessage("Ocorreu um erro ao enviar o email. Tente mais tarde.");
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          "flex flex-col gap-6 w-full max-w-sm mx-auto mb-24 sm:mb-0"
        )}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Image src={Logo} alt="Logo" className="size-20" />
          </div>
          <AuthHeader
            title="Recuperar Senha"
            description="Digite seu endereço de e-mail e enviaremos instruções para redefinir sua senha."
          />
        </div>

        <div className="grid gap-6">
          <Input
            label="Email"
            type="email"
            startIcon="Mail"
            {...register("email")}
            placeholder="Endereço de email"
            error={errors.email?.message}
          />

          <ButtonSubmit isLoading={isSubmitting} className="w-full">
            {isSubmitting ? "Enviando..." : "Verificar"}
          </ButtonSubmit>

          {message && (
            <p className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200">
              {message}
            </p>
          )}

          <BackToLogin />
        </div>
      </form>
    </>
  );
}
