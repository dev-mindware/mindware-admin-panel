"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/brand.png";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "@/utils/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/schemas";
import { ButtonSubmit, Input } from "@workspace/ui";
import { loginAction } from "@/actions/login";
import { useAuthStore } from "@/stores/auth/auth-store";
import { setAccessTokenCache } from "@/services/api";
import { GoogleButton } from "./google-button";
import { OrLine } from "./or-line";

export function LoginForm() {
  const router = useRouter();
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
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      ErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Image src={Logo} alt="Logo" className="size-20" />
        <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
        <p className="text-muted-foreground text-sm">Acesso ao painel de administração</p>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            placeholder="exemplo@mindware.ao"
            {...register("email")}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Senha</label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="Insira a senha"
            {...register("password")}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <ButtonSubmit isLoading={isSubmitting}>
          {isSubmitting ? "" : "Entrar"}
        </ButtonSubmit>

        <OrLine />
        <GoogleButton />
      </div>
    </form>
  );
}
