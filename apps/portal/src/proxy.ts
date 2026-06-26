import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Portal middleware – safety net for misrouted sub-app URLs.
 *
 * The portal only owns "/" (the app-picker page). Any other path that is NOT
 * already prefixed with "/mindgest" or "/affiliate" is a bare sub-app URL that
 * leaked through (e.g. a redirect from mindgest's RouteProtector that lost the
 * basePath). We redirect those to "/mindgest/<path>" so the user is never
 * stuck on a portal 404.
 *
 * Next.js internal paths (_next/*, favicon, etc.) are excluded automatically
 * via the matcher below.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that belong exclusively to the portal – let them through.
  const portalOwned =
    pathname === "/" ||
    pathname.startsWith("/mindgest") ||
    pathname.startsWith("/affiliate");

  if (!portalOwned) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/mindgest${pathname}`;
    return NextResponse.redirect(redirectUrl, { status: 308 }); // 308 = Permanent Redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static   (static files)
     * - _next/image    (image optimisation)
     * - favicon.ico
     * - public assets (png, svg, jpg, webp, ico, txt)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|svg|jpg|jpeg|webp|ico|txt)$).*)",
  ],
};
