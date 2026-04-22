export const ACCESS_TOKEN_COOKIE_NAME = 'access_token'
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'
export const ROLE_NAME_COOKIE_NAME = 'role_name'

export const CLUB_MEMBER_ROLE = 'CLUB_MEMBER'
export const CLUB_MANAGER_ROLE = 'CLUB_MANAGER'
export const ADMIN_ROLE = 'ADMIN'
export const SYSTEM_MANAGER_ROLE = 'SYSTEM_MANAGER'

const AUTH_PATHS = ['/auth/login', '/auth/register']
const PUBLIC_PATHS = ['/', '/about', '/contact']
const MEMBER_PATHS = ['/member', '/learn', '/mechanics']
const MANAGER_PATHS = ['/manager']
const SYSTEM_PATHS = [
  '/dashboard',
  '/lab-management',
  '/map-editor',
  '/club-management',
  '/club-requests',
  '/course-management',
  '/certificate-management',
  '/course-codes-management',
  '/user-management',
  '/role-management',
  '/permission-management',
  '/drone-management',
  '/drone-category',
  '/club-category',
  '/event-management'
]

const ADMIN_PATHS = SYSTEM_PATHS
const SYSTEM_MANAGER_PATHS = [
  '/dashboard',
  '/lab-management',
  '/map-editor',
  '/club-requests',
  '/course-management',
  '/certificate-management',
  '/course-codes-management',
  '/drone-management',
  '/event-management'
]

const SYSTEM_ROLE_PATHS: Record<string, string[]> = {
  [ADMIN_ROLE]: ADMIN_PATHS,
  [SYSTEM_MANAGER_ROLE]: SYSTEM_MANAGER_PATHS
}

const DEFAULT_SYSTEM_PATHS = ['/dashboard']

const CLUB_ROLE_NAMES = new Set([CLUB_MEMBER_ROLE, CLUB_MANAGER_ROLE])

const matchPath = (pathname: string, path: string) => {
  return pathname === path || pathname.startsWith(`${path}/`)
}

const matchPathGroup = (pathname: string, paths: string[]) => {
  return paths.some((path) => matchPath(pathname, path))
}

export const isAuthRoute = (pathname: string) => matchPathGroup(pathname, AUTH_PATHS)

export const isPublicRoute = (pathname: string) =>
  matchPathGroup(pathname, PUBLIC_PATHS)

export const isProtectedRoute = (pathname: string) => {
  return (
    matchPathGroup(pathname, MEMBER_PATHS) ||
    matchPathGroup(pathname, MANAGER_PATHS) ||
    matchPathGroup(pathname, SYSTEM_PATHS)
  )
}

export const getDefaultRouteByRole = (roleName?: string | null) => {
  if (roleName === CLUB_MEMBER_ROLE) return '/member'
  if (roleName === CLUB_MANAGER_ROLE) return '/manager'

  const systemPaths = getAllowedSystemPaths(roleName)
  if (systemPaths.length > 0) return systemPaths[0]

  return '/dashboard'
}

export const getAllowedSystemPaths = (roleName?: string | null) => {
  if (!roleName || CLUB_ROLE_NAMES.has(roleName)) return []
  return SYSTEM_ROLE_PATHS[roleName] || DEFAULT_SYSTEM_PATHS
}

export const resolveLoginRedirect = (
  roleName?: string | null,
  redirectTo?: string | null
) => {
  if (redirectTo && canAccessRoute(redirectTo, roleName)) {
    return redirectTo
  }

  return getDefaultRouteByRole(roleName)
}

export const canAccessRoute = (pathname: string, roleName?: string | null) => {
  if (!isProtectedRoute(pathname)) return true
  if (!roleName) return false

  if (matchPathGroup(pathname, MEMBER_PATHS)) {
    return (
      roleName === CLUB_MEMBER_ROLE ||
      roleName === CLUB_MANAGER_ROLE ||
      roleName === ADMIN_ROLE ||
      roleName === SYSTEM_MANAGER_ROLE
    )
  }

  if (matchPathGroup(pathname, MANAGER_PATHS)) {
    return roleName === CLUB_MANAGER_ROLE
  }

  if (matchPathGroup(pathname, SYSTEM_PATHS)) {
    return matchPathGroup(pathname, getAllowedSystemPaths(roleName))
  }

  return true
}