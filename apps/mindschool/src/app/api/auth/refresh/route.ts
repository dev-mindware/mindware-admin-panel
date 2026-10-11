import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios, { type AxiosError } from "axios";
import { createSession, destroySession } from "@/lib/session";
import { REFRESH_TOKEN_KEY } from "@/constants/auth";

/**
 * Renova a sessão: troca o refresh token (cookie httpOnly) por um par novo na API e regrava os cookies.
 * Erros de autenticação terminam a sessão local; falhas transitórias (rede, 5xx) não.
 */
export async function POST() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_TOKEN_KEY)?.value;
  if (!refreshToken) return NextResponse.json({ message: "Sessão expirada", code: "NO_REFRESH_TOKEN" }, { status: 401 });

  try {
    const res = await axios.post<{ access_token: string; refresh_token: string }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      { timeout: 10_000, headers: { "Content-Type": "application/json", "x-auth-mode": "bearer" } },
    );
    if (!res.data?.access_token || !res.data?.refresh_token) {
      await destroySession();
      return NextResponse.json({ message: "Resposta de autenticação inválida", code: "INVALID_BACKEND_RESPONSE" }, { status: 500 });
    }
    await createSession({ accessToken: res.data.access_token, refreshToken: res.data.refresh_token });
    return NextResponse.json({ success: true, accessToken: res.data.access_token });
  } catch (error) {
    const e = error as AxiosError;
    const status = e.response?.status;
    if (status === 401 || status === 403) {
      await destroySession();
      return NextResponse.json({ message: "Refresh token inválido ou expirado", code: "REFRESH_TOKEN_INVALID" }, { status: 401 });
    }
    if (e.code === "ECONNABORTED") return NextResponse.json({ message: "Timeout ao renovar a sessão", code: "REFRESH_TIMEOUT" }, { status: 504 });
    return NextResponse.json({ message: "Erro ao comunicar com o servidor de autenticação", code: "BACKEND_UNAVAILABLE" }, { status: 502 });
  }
}
