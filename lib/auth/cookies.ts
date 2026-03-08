import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  ROLE_NAME_COOKIE_NAME
} from '@/lib/auth/access'

const AUTH_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
}

const getCookieValue = (name: string): string | null => {
  if (typeof window === 'undefined') return null

  const value = getCookie(name)
  return typeof value === 'string' ? value : null
}

export const getAccessToken = (): string | null =>
  getCookieValue(ACCESS_TOKEN_COOKIE_NAME)

export const getRefreshToken = (): string | null =>
  getCookieValue(REFRESH_TOKEN_COOKIE_NAME)

export const getRoleName = (): string | null => getCookieValue(ROLE_NAME_COOKIE_NAME)

export const setAuthCookies = (
  accessToken: string,
  refreshToken: string,
  roleName?: string
) => {
  if (typeof window === 'undefined') return

  setCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, AUTH_COOKIE_OPTIONS)
  setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, AUTH_COOKIE_OPTIONS)

  if (roleName) {
    setCookie(ROLE_NAME_COOKIE_NAME, roleName, AUTH_COOKIE_OPTIONS)
  }
}

export const updateAccessTokenCookie = (accessToken: string) => {
  if (typeof window === 'undefined') return

  setCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, AUTH_COOKIE_OPTIONS)
}

export const clearAuthCookies = () => {
  if (typeof window === 'undefined') return

  deleteCookie(ACCESS_TOKEN_COOKIE_NAME, { path: '/' })
  deleteCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/' })
  deleteCookie(ROLE_NAME_COOKIE_NAME, { path: '/' })
}