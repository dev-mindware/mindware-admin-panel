"use server";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/auth";

export async function getAccessToken() {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_KEY)?.value || null;
}

export async function getRefreshToken() {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_KEY)?.value || null;
}
