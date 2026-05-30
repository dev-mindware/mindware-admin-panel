"use server";

import { destroySession } from "@/lib/session";
import { redirect } from "next/navigation";
import api from "@/services/api";

export async function logoutAction() {
  try {
    await api.post("/auth/logout");
  } catch {
  } finally {
    await destroySession();
    redirect("/auth/login");
  }
}
