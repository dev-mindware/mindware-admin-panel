"use server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/auth";
import { SessionPayload } from "@/lib/session";

export async function getSession(): Promise<SessionPayload | null> {
  const authCookies = await cookies();
  const accessToken = authCookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = authCookies.get(REFRESH_TOKEN_KEY)?.value;

  if (!refreshToken) return null;

  return {
    accessToken: accessToken ?? "",
    refreshToken,
  };
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken || null;
}

export async function getRefreshToken(): Promise<string | null> {
  const session = await getSession();
  return session?.refreshToken || null;
}
