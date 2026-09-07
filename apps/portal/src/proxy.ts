import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Portal middleware / safety net for misrouted sub-app URLs.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that belong exclusively to the portal or allowed sub-apps - let them through.
  const portalOwned =
    pathname === "/" ||
    pathname.startsWith("/mindgest") ||
    pathname.startsWith("/affiliate") ||
    pathname.startsWith("/doc-generator");

  if (!portalOwned) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/mindgest${pathname}`;
    return NextResponse.redirect(redirectUrl, { status: 308 }); // 308 = Permanent Redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|svg|jpg|jpeg|webp|ico|txt)$).*)",
  ],
};
