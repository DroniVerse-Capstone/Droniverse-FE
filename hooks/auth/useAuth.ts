import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api/client'
import {
  LoginRequest,
  LoginResponse,
  loginResponseSchema
} from '@/validations/auth'

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void
  onError?: (error: Error) => void
  redirectTo?: string
}

export const useLogin = (options?: UseLoginOptions) => {
  const router = useRouter()

  return useMutation({
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
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.data.accessToken)
        localStorage.setItem('refresh_token', data.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.data.user))
      }

      // Call custom onSuccess callback if provided
      options?.onSuccess?.(data)

      // Redirect to specified page or dashboard
      const redirectPath = options?.redirectTo || '/dashboard'
      router.push(redirectPath)
    },
    onError: (error: Error) => {
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
      
      // Clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
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
  
  const token = localStorage.getItem('access_token')
  return !!token
}
