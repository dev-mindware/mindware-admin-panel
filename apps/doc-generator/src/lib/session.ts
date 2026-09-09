import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/auth";

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

function cookieOptions(expires: Date) {
  // Configuração recomendada de segurança para cookies de sessão no frontend:
  // Secure: true, HttpOnly: true, SameSite: Strict (ou Lax se configurado), Path: /
  const isSecure = process.env.COOKIE_SECURE !== "false";
  const sameSite = (process.env.COOKIE_SAME_SITE?.toLowerCase() === "lax" ? "lax" : "strict") as "lax" | "strict";

  return {
    httpOnly: true,
    secure: isSecure,
    expires,
    sameSite,
    path: "/",
  };
}

export async function createSession(payload: SessionPayload) {
  if (!payload.accessToken || !payload.refreshToken) {
    throw new Error("Tokens de sessão inválidos");
  }

  let accessDurationMs = 24 * 60 * 60 * 1000; // 24h
  if (payload.expiresIn) {
    const match = payload.expiresIn.match(/^(\d+)([smhdw])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
      };
      accessDurationMs = value * (multipliers[unit] ?? multipliers.h);
    }
  }

  const accessExpiresAt = new Date(Date.now() + accessDurationMs);
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  const authCookies = await cookies();
  authCookies.set(
    ACCESS_TOKEN_KEY,
    payload.accessToken,
    cookieOptions(accessExpiresAt),
  );
  authCookies.set(
    REFRESH_TOKEN_KEY,
    payload.refreshToken,
    cookieOptions(refreshExpiresAt),
  );
}

export async function destroySession() {
  const authCookies = await cookies();
  const cleared = cookieOptions(new Date(0));

  authCookies.set(ACCESS_TOKEN_KEY, "", { ...cleared, maxAge: 0 });
  authCookies.set(REFRESH_TOKEN_KEY, "", { ...cleared, maxAge: 0 });
}

export async function refreshAccessToken(newAccessToken: string) {
  const authCookies = await cookies();
  const accessExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  authCookies.set(
    ACCESS_TOKEN_KEY,
    newAccessToken,
    cookieOptions(accessExpiresAt),
  );
}
