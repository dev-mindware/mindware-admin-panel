import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/constants/auth";
import api from "@/services/api";

export async function getSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;
  if (!accessToken) return null;
  return { accessToken };
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch (error) {
    return null;
  }
}
