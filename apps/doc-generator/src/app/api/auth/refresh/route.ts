import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { createSession, destroySession } from "@/lib/session";
import { REFRESH_TOKEN_KEY } from "@/constants/auth";

export async function POST() {
  try {
    const authCookies = await cookies();
    const refreshToken = authCookies.get(REFRESH_TOKEN_KEY)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token não encontrado na sessão" },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    const response = await axios.post(
      `${apiUrl}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        timeout: 10000,
      }
    );

    const data = response.data;
    const newAccessToken = data.tokens?.accessToken || data.accessToken;
    const newRefreshToken = data.tokens?.refreshToken || data.refreshToken || refreshToken;
    const newExpiresIn = data.tokens?.expiresIn;

    if (!newAccessToken) {
      await destroySession();
      return NextResponse.json(
        { message: "Tokens inválidos retornados pela API" },
        { status: 500 }
      );
    }

    // Grava os novos cookies HttpOnly no Next.js (Segurança máxima no Frontend)
    await createSession({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: newExpiresIn,
    });

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: newExpiresIn,
      },
      user: data.user,
    });
  } catch (error: any) {
    console.error("🚨 [Refresh Route] Erro ao renovar token:", error?.message);
    await destroySession();
    return NextResponse.json(
      {
        message: "Erro ao renovar sessão",
        details: error?.response?.data || error?.message,
      },
      { status: error?.response?.status || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Método não permitido" }, { status: 405 });
}
