import { NextResponse, NextRequest } from "next/server";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/auth";
import { BASE_PATH } from "@/constants/routes";

function stripBasePath(pathname: string) {
  if (BASE_PATH && pathname === BASE_PATH) return "/";
  if (BASE_PATH && pathname.startsWith(`${BASE_PATH}/`)) return pathname.slice(BASE_PATH.length) || "/";
  return pathname;
}

/** Redirecções absolutas perdem o basePath: a zone junta-o sempre explicitamente (como as outras apps do portal). */
function zoneUrl(path: string, requestUrl: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${BASE_PATH}${normalized}`, requestUrl);
}

export function proxy(request: NextRequest) {
  const pathname = stripBasePath(request.nextUrl.pathname);
  if (pathname.startsWith("/api")) return NextResponse.next();

  const isPublicPath = pathname === "/" || pathname === "/auth/login";
  // a sessão é renovável enquanto houver refresh token (o de acesso expira cedo e renova-se sozinho)
  const hasSession = request.cookies.has(REFRESH_TOKEN_KEY) || request.cookies.has(ACCESS_TOKEN_KEY);

  if (!isPublicPath && !hasSession) return NextResponse.redirect(zoneUrl("/auth/login", request.url));
  if (pathname === "/auth/login" && hasSession) return NextResponse.redirect(zoneUrl("/dashboard", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:png|svg|jpg|jpeg|gif|json|ico)).*)"],
};
