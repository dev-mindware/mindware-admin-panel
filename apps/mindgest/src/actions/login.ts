"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { LoginResponse, BaseUser } from "@/types";
import { loginSchema } from "@/schemas";
import api from "@/services/api";
import { createSession } from "@/lib/session";
import { getSession } from "@/lib/auth";

function toClientUser(user: LoginResponse["user"]): BaseUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? "",
    role: user.role,
    company: user.company
      ? {
          id: (user.company as { id?: string }).id,
          name: (user.company as { name?: string }).name,
        }
      : undefined,
    avatar: (user as { avatar?: string }).avatar,
  };
}

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

    if (!tokens?.accessToken || !tokens?.refreshToken) {
      throw new Error("Resposta de autenticação incompleta");
    }

    await createSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });

    return {
      message,
      user: toClientUser(user),
      redirectPath: "/dashboard",
    };
  } catch (error: unknown) {
    let messageError = "Ocorreu um erro desconhecido!";

    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const responseData = (error as { response?: { data?: { message?: string | string[] } } }).response?.data;
      if (typeof responseData?.message === "string") {
        messageError = responseData.message;
      } else if (Array.isArray(responseData?.message)) {
        messageError = responseData.message.join(", ");
      }
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
    redirect("/auth/login");
  }
}
