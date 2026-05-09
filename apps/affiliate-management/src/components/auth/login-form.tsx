"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/brand.png";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/schemas";
import { 
  ButtonSubmit, 
  Input,
  Field,
  FieldLabel,
  FieldContent,
  FieldError
} from "@workspace/ui";
import { loginAction } from "@/actions/login";
import { useAuthStore } from "@/stores/auth/auth-store";
import { GoogleButton } from "./google-button";
import { OrLine } from "./or-line";

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const {
    control,
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

      // The useFetchUser hook will pick up the user from the cookie
      router.replace("/dashboard");
    } catch (error) {
      console.error(error);
      ErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 shadow-inner">
           <Image src={Logo} alt="Logo" width={64} height={64} className="drop-shadow-lg" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground text-sm">Insira os seus dados para aceder ao painel</p>
        </div>
      </div>

      <div className="grid gap-5">
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  placeholder="exemplo@mindware.ao"
                  {...field}
                  autoComplete="email"
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
        
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Senha</FieldLabel>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary font-medium hover:underline underline-offset-4"
                >
                  Esqueceu a sua senha?
                </Link>
              </div>
              <FieldContent>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  autoComplete="current-password"
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <ButtonSubmit isLoading={isSubmitting}>
          {isSubmitting ? "" : "Entrar no Painel"}
        </ButtonSubmit>

        <OrLine />
        <GoogleButton />
      </div>
      <p className="text-xs text-center text-muted-foreground px-8">
        Ao entrar, concorda com os nossos{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">Termos de Serviço</Link> e{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">Privacidade</Link>.
      </p>
    </form>
  );
}
