import { NextResponse, NextRequest } from 'next/server'
import { ACCESS_TOKEN_KEY } from '@/constants/auth'

// This proxy handles route protection and session management
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public paths that don't require authentication
  const isPublicPath = pathname === '/auth/login' || pathname === '/auth/register' || pathname.startsWith('/api/public')

  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value

  // Redirect to login if trying to access a protected route without a token
  if (!isPublicPath && !accessToken) {
    const loginUrl = new URL('/auth/login', request.url)
    // Optional: add a redirect parameter
    // loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if trying to access auth pages with a valid token
  if (isPublicPath && accessToken && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Config to specify which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
