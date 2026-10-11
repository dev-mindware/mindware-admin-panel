"use server";

import type { AxiosError } from "axios";
import { api } from "@/services/api";
import { createSession, destroySession } from "@/lib/session";
import type { ApiMe } from "@/types/api";
import type { LoginFormData } from "@/schemas";

interface ApiLogin {
  access_token: string;
  refresh_token: string;
}

export interface LoginResult {
  success?: boolean;
  error?: string;
  /** A conta tem segundo factor: pedir o código e repetir o início de sessão. */
  requiresMfa?: boolean;
  accessToken?: string;
  user?: { id: string; email: string; name: string; role: "admin"; phone: string };
}

/** Início de sessão do painel: só entra quem tem o papel de administrador de sistema (verificado em /auth/me). */
export async function loginAction({ email, password, totpCode }: LoginFormData): Promise<LoginResult> {
  try {
    const res = await api.post<ApiLogin>("/auth/login", { email, password, ...(totpCode ? { totp_code: totpCode } : {}) });
    const { access_token: accessToken, refresh_token: refreshToken } = res.data;
    if (!accessToken || !refreshToken) return { error: "Resposta de autenticação inválida." };

    const me = (await api.get<ApiMe>("/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } })).data;
    if (!me.memberships.some((m) => m.roles.includes("admin_sistema"))) {
      // a sessão criada na API fica por terminar de propósito curta (token de acesso); aqui nada se guarda
      return { error: "Acesso restrito à administração da plataforma." };
    }

    await createSession({ accessToken, refreshToken });
    return { success: true, accessToken, user: { id: me.id, email: me.email, name: me.full_name, role: "admin", phone: "" } };
  } catch (error) {
    const problem = (error as AxiosError<{ code?: string; detail?: string }>).response?.data;
    if (problem?.code === "MFA_REQUIRED") return { requiresMfa: true };
    return { error: problem?.detail ?? "Não foi possível iniciar sessão. Verifique as credenciais." };
  }
}

export async function logoutAction() {
  try {
    const { getRefreshToken } = await import("@/actions/token");
    const refreshToken = await getRefreshToken();
    if (refreshToken) await api.post("/auth/logout", { refresh_token: refreshToken });
  } catch {
    /* a sessão local é sempre terminada */
  } finally {
    await destroySession();
  }
}
