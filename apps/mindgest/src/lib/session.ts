import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;

export const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string; // e.g., "4m", "1h"
}

export async function createSession(payload: SessionPayload) {
  // Parse expiresIn do backend (ex: "4m")
  let accessDurationMs = 60 * 60 * 1000; // Default: 60 min

  if (payload.expiresIn) {
    const match = payload.expiresIn.match(/^(\d+)([smhdw])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
      };
      accessDurationMs = value * multipliers[unit];
    }
  }

  const accessExpiresAt = new Date(Date.now() + accessDurationMs);
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const authCookies = await cookies();
  authCookies.set(ACCESS_TOKEN_KEY, payload.accessToken, {
    httpOnly: true,
    secure: true,
    expires: accessExpiresAt,
    sameSite: "lax",
    path: "/",
  });

  authCookies.set(REFRESH_TOKEN_KEY, payload.refreshToken, {
    httpOnly: true,
    secure: true,
    expires: refreshExpiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function destroySession() {
  const authCookies = await cookies();

  const options = {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: true,
  };

  authCookies.set(ACCESS_TOKEN_KEY, "", options);
  authCookies.set(REFRESH_TOKEN_KEY, "", options);
}
