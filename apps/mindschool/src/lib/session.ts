import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/auth";

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
}

const secure = () => process.env.NODE_ENV === "production";

/** Os dois cookies são httpOnly: o navegador nunca lê os tokens; o cliente obtém o de acesso por server action. */
export async function createSession(payload: SessionPayload) {
  const authCookies = await cookies();
  const base = { httpOnly: true, secure: secure(), sameSite: "lax" as const, path: "/" };
  authCookies.set(ACCESS_TOKEN_KEY, payload.accessToken, { ...base, expires: new Date(Date.now() + 60 * 60 * 1000) });
  authCookies.set(REFRESH_TOKEN_KEY, payload.refreshToken, { ...base, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
}

export async function destroySession() {
  const authCookies = await cookies();
  const base = { httpOnly: true, secure: secure(), sameSite: "lax" as const, path: "/", expires: new Date(0), maxAge: 0 };
  authCookies.set(ACCESS_TOKEN_KEY, "", base);
  authCookies.set(REFRESH_TOKEN_KEY, "", base);
}
