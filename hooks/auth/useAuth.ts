import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AxiosError } from 'axios'
import apiClient from '@/lib/api/client'
import { resolveLoginRedirect } from '@/lib/auth/access'
import { clearAuthCookies, getAccessToken, setAuthCookies } from '@/lib/auth/cookies'
import { ApiError } from '@/types/api/common'
import {
  LoginRequest,
  LoginResponse,
  loginResponseSchema
} from '@/validations/auth'

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
  redirectTo?: string
}

export const useLogin = (options?: UseLoginOptions) => {
  const router = useRouter()

  return useMutation<LoginResponse, AxiosError<ApiError>, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>(
        '/auth/login',
        credentials
      )

      // Validate response with Zod schema
      const validatedData = loginResponseSchema.parse(response.data)

      return validatedData
    },
    onSuccess: (data) => {
      // Store tokens in cookies
      if (typeof window !== 'undefined') {
        setAuthCookies(
          data.data.accessToken,
          data.data.refreshToken,
          data.data.user.roleName
        )
        localStorage.setItem('user', JSON.stringify(data.data.user))
      }

      // Call custom onSuccess callback if provided
      options?.onSuccess?.(data)

      const redirectPath = resolveLoginRedirect(
        data.data.user.roleName,
        options?.redirectTo
      )

      router.push(redirectPath)
    },
    onError: (error) => {
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error)
      }

      // Call custom onError callback if provided
      options?.onError?.(error)
    }
  })
}

export const useLogout = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      // Optionally call logout endpoint
      // await apiClient.post('/auth/logout')
      
      // Clear auth cookies and local user cache
      if (typeof window !== 'undefined') {
        clearAuthCookies()
        localStorage.removeItem('user')
      }
    },
    onSuccess: () => {
      // Redirect to login page
      router.push('/auth/login')
    }
  })
}

// Helper function to get current user from localStorage
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null

  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false

  const token = getAccessToken()
  return !!token
}
