import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSession } from "@/lib/session";
import { clearLocalSession } from "@/actions/auth";
import { REFRESH_TOKEN_KEY, ACCESS_TOKEN_KEY } from "@/constants";

export async function POST() {
  try {
    const authCookies = await cookies();
    const refreshToken = authCookies.get(REFRESH_TOKEN_KEY)?.value;
    const accessToken = authCookies.get(ACCESS_TOKEN_KEY)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token não encontrado na sessão" },
        { status: 401 },
      );
    }

    // Faz a chamada à API backend para renovar o token
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_API_KEY
            ? { "x-api-key": process.env.NEXT_PUBLIC_API_KEY }
            : {}),
        },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🚨 [Refresh Route] Backend rejected refresh:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        payloadSent: { refreshToken },
      });

      await clearLocalSession();
      return NextResponse.json(
        {
          message: "A API externa recusou a renovação do token",
          details: errorText,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Conforme o exemplo do usuário: data.tokens.accessToken e data.tokens.refreshToken
    const newAccessToken = data.tokens?.accessToken;
    const newRefreshToken = data.tokens?.refreshToken;
    const newExpiresIn = data.tokens?.expiresIn;

    if (!newAccessToken || !newRefreshToken) {
      console.error(
        "🚨 [Refresh Route] Tokens não encontrados na resposta:",
        data,
      );
      return NextResponse.json(
        { message: "Tokens inválidos retornados pela API", details: data },
        { status: 500 },
      );
    }

    // Grava os novos cookies HttpOnly
    await createSession({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: newExpiresIn,
    });

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    console.error("🚨 [API Route] Erro crítico renovando o token:", error);
    await clearLocalSession();
    return NextResponse.json(
      {
        message: "Erro de Servidor na Rota de Refresh",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
