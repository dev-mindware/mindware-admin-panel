import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/constants/auth";

export async function getAccessToken() {
  // Server-side
  if (typeof window === "undefined") {
    try {
      const cookieStore = await cookies();
      return cookieStore.get(ACCESS_TOKEN_KEY)?.value || null;
    } catch (e) {
      return null;
    }
  }

  // Client-side
  const match = document.cookie.match(new RegExp('(^| )' + ACCESS_TOKEN_KEY + '=([^;]+)'));
  return match ? match[2] : null;
}
