"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ButtonSubmit, Input } from "@workspace/ui";
import { authService, LoginDto } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth";
import { HeroImageSide } from "@/components/auth/hero-image-side";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setIsAuthenticating } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginDto) => {
    setIsSubmitting(true);
    try {
      const res = await authService.login(data);
      setIsAuthenticating(false);
      setUser(res.user);
      toast.success(res.message || "Sessão iniciada com sucesso!");
      router.push("/dashboard");
    } catch (err: any) {
      setIsAuthenticating(false);
      toast.error(
        err.response?.data?.message || "Credenciais inválidas. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen min-h-dvh w-full overflow-hidden lg:grid-cols-2 bg-background">
      {/* Mindgest-identical Hero Left Column with Mindware logo */}
      <div className="hidden lg:block">
        <HeroImageSide
          source="/doc-generator/login-hero.webp"
          title="Gestão e geração de propostas para empresas e profissionais."
          subtitle="Uma forma simples de orçamentar, controlar a actividade e emitir documentos oficiais da Mindware."
          badge="MINDWARE - Document Generator"
        />
      </div>

      {/* Right Column Form with Mindware Logo */}
      <div className="flex min-h-[100svh] items-center justify-center bg-background p-6 md:p-12 lg:min-h-0">
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative h-16 w-36 mb-1">
                <Image
                  src="/doc-generator/mindware.png"
                  fill
                  alt="Logótipo da Mindware"
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Bem-vindo ao Doc Generator
              </h1>
              <p className="text-xs text-muted-foreground">
                Introduza as suas credenciais para aceder ao sistema
              </p>
            </div>

            <div className="grid gap-4">
              <Input
                type="email"
                label="Email"
                startIcon="AtSign"
                placeholder="Endereço de email"
                {...register("email", { required: "Email obrigatório" })}
                error={errors.email?.message}
                autoComplete="email"
              />

              <div className="flex flex-col space-y-2">
                <Input
                  label="Palavra-passe"
                  startIcon="Lock"
                  type="password"
                  placeholder="Introduza a palavra-passe"
                  {...register("password", { required: "Palavra-passe obrigatória" })}
                  error={errors.password?.message}
                  autoComplete="current-password"
                />
                <span className="ml-auto text-xs text-primary underline-offset-4 hover:underline cursor-pointer">
                  Esqueceu a sua palavra-passe?
                </span>
              </div>

              <ButtonSubmit isLoading={isSubmitting} className="w-full mt-2 cursor-pointer">
                Entrar
              </ButtonSubmit>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Ainda não tem uma conta?{" "}
              <span className="font-medium text-primary cursor-pointer hover:underline">
                Contacte o Administrador
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
