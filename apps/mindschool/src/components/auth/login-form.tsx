"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonSubmit, Input } from "@workspace/ui";
import Logo from "@/assets/brand.png";
import { loginAction } from "@/actions/login";
import { BASE_PATH } from "@/constants/routes";
import { loginSchema, type LoginFormData } from "@/schemas";
import { setAccessTokenCache } from "@/services/api";
import { useAuthStore } from "@/stores/auth/auth-store";
import { ErrorMessage } from "@/utils/messages";

/** Início de sessão em dois passos quando a conta tem segundo factor: credenciais, depois o código de 6 dígitos (ou de recuperação). */
export function LoginForm() {
  const { setUser, setIsAuthenticating } = useAuthStore();
  const [needsCode, setNeedsCode] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    try {
      const res = await loginAction(data);
      if (res.requiresMfa) {
        setNeedsCode(true);
        return;
      }
      if (res.error || !res.accessToken || !res.user) {
        ErrorMessage(res.error ?? "Não foi possível iniciar sessão.");
        if (needsCode) setValue("totpCode", "");
        return;
      }
      setAccessTokenCache(res.accessToken);
      setUser(res.user);
      setIsAuthenticating(false);
      // navegação completa: tem de incluir o basePath da zone
      window.location.replace(`${BASE_PATH}/dashboard`);
    } catch (error) {
      console.error(error);
      ErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative size-20 overflow-hidden rounded-2xl bg-muted/40 shadow-sm ring-1 ring-border">
          <Image src={Logo} alt="MindSchool" fill className="object-contain p-2" sizes="80px" priority />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">MindSchool</p>
          <h1 className="text-2xl font-bold tracking-tight">Painel de administração</h1>
          <p className="text-sm text-muted-foreground">
            {needsCode ? "Introduza o código do seu autenticador." : "Entre com as credenciais de administrador da plataforma."}
          </p>
        </div>
      </div>

      <div className="grid gap-5">
        <div className={needsCode ? "hidden" : "grid gap-5"}>
          <Input type="email" label="Email" startIcon="AtSign" placeholder="admin@mindware.ao" autoComplete="email" {...register("email")} error={errors.email?.message} />
          <Input type="password" label="Palavra-passe" startIcon="Lock" placeholder="Insira a palavra-passe" autoComplete="current-password" {...register("password")} error={errors.password?.message} />
        </div>

        {needsCode && (
          <Input
            label="Código de 6 dígitos (ou de recuperação)"
            startIcon="Hash"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="000000"
            {...register("totpCode")}
          />
        )}

        <ButtonSubmit isLoading={isSubmitting}>{isSubmitting ? "" : needsCode ? "Confirmar e entrar" : "Entrar no painel"}</ButtonSubmit>
        {needsCode && (
          <button type="button" className="text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => { setNeedsCode(false); setValue("totpCode", ""); }}>
            Voltar
          </button>
        )}
      </div>
    </form>
  );
}
