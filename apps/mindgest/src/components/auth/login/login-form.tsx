"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/mindgest.png";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@/utils/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/schemas";
import { ButtonSubmit, Input } from "@/components";
import { loginAction } from "@/actions/login";
import { useAuthStore } from "@workspace/hooks";

export function LoginForm() {
  const { setUser } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function handleLogin({ email, password }: LoginFormData) {
    try {
      const res = await loginAction({ email, password });

      if (!res.user) {
        ErrorMessage(res.message || "Erro ao tentar fazer login.");
        return;
      }

      setUser(res.user);
      // router.replace does not reliably prepend the Next.js basePath when the
      // path comes from an external source (server action). Use window.location
      // with an explicit basePath to guarantee the URL always has /mindgest.
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/mindgest";
      const destination = res.redirectPath?.startsWith("/")
        ? `${basePath}${res.redirectPath}`
        : `${basePath}/dashboard`;
      window.location.replace(destination);
    } catch (error) {
      console.error(error);
      ErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative size-20 overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-border shadow-sm">
          <Image
            src={Logo}
            alt="Mindgest"
            fill
            className="object-contain p-2"
            sizes="80px"
            priority
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Mindgest
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Painel Administrativo
          </h1>
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
          placeholder="admin@empresa.com"
          {...register("email")}
          error={errors?.email && errors?.email?.message}
          autoComplete="email"
        />
        <div className="flex flex-col space-y-2">
          <Input
            label="Senha"
            startIcon="Lock"
            type="password"
            placeholder="Insira a senha"
            {...register("password")}
            error={errors?.password && errors?.password?.message}
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
