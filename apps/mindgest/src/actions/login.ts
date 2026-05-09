"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { LoginResponse, BaseUser } from "@/types";
import { loginSchema } from "@/schemas";
import api from "@/services/api";
import { createSession } from "@/lib/session";
import { getSession } from "@/lib/auth";

export async function loginAction({
  email,
  password,
}: z.infer<typeof loginSchema>): Promise<{
  user: BaseUser | null;
  redirectPath?: string;
  message?: string;
}> {
  try {
    const res = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    const { user, tokens, message } = res.data;

    if (!user) {
      throw new Error("Usuário não autorizado");
    }
    console.log(res.data);

    await createSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });

    const redirectPath = "/dashboard";
    console.log(`Login bem-sucedido! Redirecionando para: ${redirectPath}`);

    return { message, user, redirectPath };
  } catch (error: any) {
    let messageError = "Ocorreu um erro desconhecido!";

    if (error?.response?.data?.message) {
      messageError = error.response.data.message;
    } else if (error instanceof Error) {
      messageError = error.message;
    }

    return {
      user: null,
      redirectPath: "/auth/login",
      message: messageError,
    };
  }
}

export async function logoutAction() {
  try {
    const session = await getSession();
    await api.post("/auth/logout", { refresh_token: session?.refreshToken });
  } catch (error) {
    console.error("🚨 Erro ao fazer logout remoto:", error);
  } finally {
    const { destroySession } = await import("@/lib/session");
    await destroySession();
    redirect("/mindgest/auth/login");
  }
}
