"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/brand.png";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@/utils/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/schemas";
import { ButtonSubmit, Input } from "@workspace/ui";
import { loginAction } from "@/actions/login";
import { useAuthStore } from "@/stores/auth/auth-store";
import { setAccessTokenCache } from "@/services/api";
import { BASE_PATH } from "@/constants/routes";

export function LoginForm() {
  const { setUser, setIsAuthenticating } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function handleLogin(data: LoginFormData) {
    try {
      const res = await loginAction(data);

      if (res.error) {
        ErrorMessage(res.error);
        return;
      }

      if (!res.accessToken || !res.user) {
        ErrorMessage("Sessão iniciada, mas não foi possível carregar os dados do utilizador.");
        return;
      }

      setAccessTokenCache(res.accessToken);
      setUser(res.user);
      setIsAuthenticating(false);

      // window.location / full navigation must include basePath (/affiliate).
      // router.replace is fine for in-app paths, but full replace is safer after login.
      window.location.replace(`${BASE_PATH}/dashboard`);
    } catch (error) {
      console.error(error);
      ErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative size-20 overflow-hidden rounded-2xl bg-muted/40 shadow-sm ring-1 ring-border">
          <Image
            src={Logo}
            alt="Mindware Affiliate"
            fill
            className="object-contain p-2"
            sizes="80px"
            priority
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Mindware Affiliate
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Entre com as suas credenciais de administrador
          </p>
        </div>
      </div>

      <div className="grid gap-5">
        <Input
          type="email"
          label="Email"
          startIcon="AtSign"
          placeholder="admin@mindware.ao"
          {...register("email")}
          error={errors.email?.message}
          autoComplete="email"
        />

        <div className="flex flex-col gap-2">
          <Input
            type="password"
            label="Senha"
            startIcon="Lock"
            placeholder="Insira a senha"
            {...register("password")}
            error={errors.password?.message}
            autoComplete="current-password"
          />
          <Link
            href="/auth/forgot-password"
            className="ml-auto text-sm text-primary underline-offset-4 hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        <ButtonSubmit isLoading={isSubmitting}>
          {isSubmitting ? "" : "Entrar no painel"}
        </ButtonSubmit>
      </div>
    </form>
  );
}
