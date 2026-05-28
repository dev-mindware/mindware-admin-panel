"use server";

import { destroySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { BASE_PATH } from "@/constants/routes";
import api from "@/services/api";

export async function logoutAction() {
  try {
    await api.post("/auth/logout");
  } catch {
  } finally {
    await destroySession();
    redirect(`${BASE_PATH}/auth/login`);
  }
}
