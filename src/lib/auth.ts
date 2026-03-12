"use server";
import { cookies } from "next/headers";
import { SessionPayload } from "./session";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";

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
