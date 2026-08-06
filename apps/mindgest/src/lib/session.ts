import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;

export const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string; // e.g., "4m", "1h"
}

function cookieOptions(expires: Date) {
  // path "/" so cookies are visible to middleware and all routes under basePath
  // after reverse-proxy rewrites (hosts that share cookies across apps should isolate by name).
  const isSecure = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isSecure,
    expires,
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function createSession(payload: SessionPayload) {
  if (!payload.accessToken || !payload.refreshToken) {
    throw new Error("Tokens de sessão inválidos");
  }

  // Parse expiresIn do backend (ex: "4m", "24h")
  let accessDurationMs = 60 * 60 * 1000; // Default: 60 min

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
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
