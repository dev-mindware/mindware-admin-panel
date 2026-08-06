import { NextRequest, NextResponse } from "next/server";
import {
  API_AUTH_PREFIX,
  BASE_PATH,
  DEFAULT_AUTHENTICATED_REDIRECT,
  DEFAULT_LOGIN_REDIRECT,
  PRIVATE_ROUTE_PREFIXES,
  PUBLIC_ROUTES,
  REFRESH_TOKEN_KEY,
} from "./constants";

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;

  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return false;
    if (!pathname.startsWith(route)) return false;

    const nextChar = pathname[route.length];
    return !nextChar || nextChar === "/" || nextChar === "?";
  });
}

function isAuthPage(pathname: string): boolean {
  return [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
  ].includes(pathname);
}

/**
 * Absolute redirects via `new URL('/dashboard', req.url)` drop the Next.js
 * basePath, sending browsers to e.g. `host/dashboard` instead of
 * `host/mindgest/dashboard`. Always prefix basePath explicitly.
 */
function redirectWithinApp(req: NextRequest, path: string) {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || BASE_PATH || "").replace(
    /\/$/,
    "",
  );
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return NextResponse.redirect(new URL(`${base}${normalized}`, req.url));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith(API_AUTH_PREFIX)) {
    return NextResponse.next();
  }

  const isAuthenticated = req.cookies.has(REFRESH_TOKEN_KEY);

  const isPublic = isPublicRoute(pathname);
  const isPrivate = PRIVATE_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));

  if (isPublic) {
    if (isAuthenticated && isAuthPage(pathname)) {
      return redirectWithinApp(req, DEFAULT_AUTHENTICATED_REDIRECT);
    }

    return NextResponse.next();
  }

  if (!isAuthenticated && isPrivate) {
    return redirectWithinApp(req, DEFAULT_LOGIN_REDIRECT);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|json|webp|ico)|\\.well-known|unauthorized).*)",
  ],
};
