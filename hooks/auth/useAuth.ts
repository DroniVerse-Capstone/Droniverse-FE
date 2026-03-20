"use client"

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AxiosError } from 'axios'
import apiClient from '@/lib/api/client'
import { resolveLoginRedirect } from '@/lib/auth/access'
import { clearAuthCookies, getAccessToken, setAuthCookies } from '@/lib/auth/cookies'
import { getStoredUser, useAuthStore } from '@/stores/auth-store'
import { ApiError } from '@/types/api/common'
import {
  LoginRequest,
  LoginResponse,
  loginResponseSchema,
  MeResponse,
  meResponseSchema,
  RegisterRequest,
  RegisterResponse,
  registerResponseSchema
} from '@/validations/auth'
import toast from 'react-hot-toast'

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
  redirectTo?: string
}

interface UseRegisterOptions {
  onSuccess?: (data: RegisterResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
  redirectTo?: string
}

interface UseMeOptions {
  enabled?: boolean
  onSuccess?: (data: MeResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
}

export const useMe = (options?: UseMeOptions) => {
  const onSuccess = options?.onSuccess
  const onError = options?.onError

  const query = useQuery<MeResponse, AxiosError<ApiError>>({
    queryKey: ['auth', 'me'],
    enabled: options?.enabled,
    queryFn: async () => {
      const response = await apiClient.get<MeResponse>('/auth/me')

      return meResponseSchema.parse(response.data)
    }
  })

  useEffect(() => {
    if (query.data) {
      if (typeof window !== 'undefined') {
        useAuthStore.getState().setUser(query.data.data)
      }

      onSuccess?.(query.data)
    }
  }, [onSuccess, query.data])

  useEffect(() => {
    if (query.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Me API error:', query.error)
      }

      onError?.(query.error)
    }
  }, [onError, query.error])

  return query
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
        useAuthStore.getState().setUser(data.data.user)
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

export const useRegister = (options?: UseRegisterOptions) => {
  const router = useRouter()

  return useMutation<RegisterResponse, AxiosError<ApiError>, RegisterRequest>({
    mutationFn: async (payload: RegisterRequest) => {
      const response = await apiClient.post<RegisterResponse>(
        '/auth/register',
        payload
      )

      return registerResponseSchema.parse(response.data)
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data)

      if (options?.redirectTo) {
        router.push(options.redirectTo)
        return
      }

      router.push('/auth/login')
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Register error:', error)
      }

      options?.onError?.(error)
    }
  })
}

export const useLogout = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/auth/logout')
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Logout API error:', error)
        }
      }

      // Clear auth cookies and in-memory user cache
      if (typeof window !== 'undefined') {
        clearAuthCookies()
        useAuthStore.getState().clearUser()
        queryClient.clear()
      }
    },
    onSuccess: () => {
      toast.success('Seeyah! 👋')
      router.push('/auth/login')
    }
  })
}

// Helper function to get current user from auth store
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null

  return getStoredUser()
}

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false

  const token = getAccessToken()
  return !!token
}
