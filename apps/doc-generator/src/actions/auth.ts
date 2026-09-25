"use server";
import { createSession, destroySession } from "@/lib/session";

export async function clearLocalSession() {
  await destroySession();
}

export async function setServerSession(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}) {
  await createSession(tokens);
}

export async function logoutAction() {
  await destroySession();
}
