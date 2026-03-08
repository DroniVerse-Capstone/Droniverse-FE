import { NextRequest, NextResponse } from 'next/server'
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  ROLE_NAME_COOKIE_NAME,
  canAccessRoute,
  getDefaultRouteByRole,
  isAuthRoute,
  isPublicRoute,
  isProtectedRoute
} from '@/lib/auth/access'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value
  const roleName = request.cookies.get(ROLE_NAME_COOKIE_NAME)?.value
  const isAuthenticated = Boolean(accessToken)

  if (isAuthenticated && !roleName) {
    const loginUrl = new URL('/auth/login', request.url)
    const response = NextResponse.redirect(loginUrl)

    response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME)
    response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME)
    response.cookies.delete(ROLE_NAME_COOKIE_NAME)

    return response
  }

  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && isAuthRoute(pathname)) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(roleName), request.url)
    )
  }

  if (isAuthenticated && isPublicRoute(pathname)) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(roleName), request.url)
    )
  }

  if (isAuthenticated && !canAccessRoute(pathname, roleName)) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(roleName), request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
}