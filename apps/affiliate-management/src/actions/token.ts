"use server";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/auth";

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value || null;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value || null;
}
