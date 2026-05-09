import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/auth";

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
}

export async function createSession(payload: SessionPayload) {
  const accessExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const authCookies = await cookies();
  
  const isSecure = ACCESS_TOKEN_KEY.startsWith("__Secure-") || process.env.NODE_ENV === "production";

  authCookies.set(ACCESS_TOKEN_KEY, payload.accessToken, {
    httpOnly: false,
    secure: isSecure,
    expires: accessExpiresAt,
    sameSite: "lax",
    path: "/",
  });

  authCookies.set(REFRESH_TOKEN_KEY, payload.refreshToken, {
    httpOnly: true,
    secure: isSecure,
    expires: refreshExpiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function destroySession() {
  const authCookies = await cookies();

  const isSecure = ACCESS_TOKEN_KEY.startsWith("__Secure-") || process.env.NODE_ENV === "production";

  const baseOptions = {
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(0),
  };

  authCookies.set(ACCESS_TOKEN_KEY, "", { ...baseOptions, httpOnly: false });
  authCookies.set(REFRESH_TOKEN_KEY, "", { ...baseOptions, httpOnly: true });
  
  // Cleanup legacy cookies
  authCookies.set("access_token", "", { ...baseOptions, httpOnly: false });
  authCookies.set("refresh_token", "", { ...baseOptions, httpOnly: true });
}
