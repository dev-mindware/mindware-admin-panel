import { cookies } from "next/headers";
import { REFRESH_TOKEN_KEY, ACCESS_TOKEN_KEY } from "@/constants/auth";

/** Sessão presente (renovável): serve o refresh; o de acesso pode ter expirado e renova-se sozinho. */
export async function getSession(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_TOKEN_KEY)?.value;
  if (!refreshToken) return null;
  return { accessToken: store.get(ACCESS_TOKEN_KEY)?.value ?? "", refreshToken };
}
