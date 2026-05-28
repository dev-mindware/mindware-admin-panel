import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token } = response.data;

    const res = NextResponse.json({ accessToken: access_token });

    const isSecure = ACCESS_TOKEN_KEY.startsWith("__Secure-") || process.env.NODE_ENV === "production";

    res.cookies.set(ACCESS_TOKEN_KEY, access_token, {
      httpOnly: false,
      secure: isSecure,
      path: "/",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
    });

    if (refresh_token) {
      res.cookies.set(REFRESH_TOKEN_KEY, refresh_token, {
        httpOnly: true,
        secure: isSecure,
        path: "/",
        sameSite: "lax",
        maxAge: 7 * 24 * 3600, // 7 days
      });
    }

    return res;
  } catch (error: any) {
    console.error("Refresh Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
  }
}
