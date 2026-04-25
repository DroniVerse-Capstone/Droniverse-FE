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
  registerResponseSchema,
  uploadAvatarRequestSchema,
  uploadAvatarResponseSchema,
  UploadAvatarRequest,
  UploadAvatarResponse,
  UpdateMeRequest,
  UpdateMeResponse,
  updateMeResponseSchema,
  VerifyEmailRequest,
  VerifyEmailResponse,
  verifyEmailResponseSchema
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

interface UseVerifyEmailOptions {
  onSuccess?: (data: VerifyEmailResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
  redirectTo?: string
}

interface UseUpdateMeOptions {
  onSuccess?: (data: UpdateMeResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
}

interface UseUploadAvatarOptions {
  onSuccess?: (data: UploadAvatarResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
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
      const response = await apiClient.get<MeResponse>('/identity/auth/me')

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
        '/identity/auth/login',
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
        '/identity/auth/register',
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

export const useVerifyEmail = (options?: UseVerifyEmailOptions) => {
  const router = useRouter()

  return useMutation<VerifyEmailResponse, AxiosError<ApiError>, VerifyEmailRequest>({
    mutationFn: async (payload: VerifyEmailRequest) => {
      const response = await apiClient.post<VerifyEmailResponse>(
        '/identity/auth/verify-email',
        payload
      )

      return verifyEmailResponseSchema.parse(response.data)
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data)

      if (options?.redirectTo) {
        router.push(options.redirectTo)
      }
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Verify email error:', error)
      }

      options?.onError?.(error)
    }
  })
}

export const useUpdateMe = (options?: UseUpdateMeOptions) => {
  const queryClient = useQueryClient()

  return useMutation<UpdateMeResponse, AxiosError<ApiError>, UpdateMeRequest>({
    mutationFn: async (payload: UpdateMeRequest) => {
      const response = await apiClient.put<UpdateMeResponse>(
        '/identity/auth/me',
        payload
      )

      return updateMeResponseSchema.parse(response.data)
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Update me error:', error)
      }

      options?.onError?.(error)
    }
  })
}

export const useUploadAvatar = (options?: UseUploadAvatarOptions) => {
  const queryClient = useQueryClient()

  return useMutation<UploadAvatarResponse, AxiosError<ApiError>, UploadAvatarRequest>({
    mutationFn: async (payload: UploadAvatarRequest) => {
      const parsedPayload = uploadAvatarRequestSchema.parse(payload)
      const formData = new FormData()
      formData.append('file', parsedPayload.file)

      const requestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }

      try {
        const response = await apiClient.post<UploadAvatarResponse>(
          `/identity/users/${parsedPayload.userId}/upload-avatar`,
          formData,
          requestConfig
        )

        return uploadAvatarResponseSchema.parse(response.data)
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>
        const isNotFound = axiosError.response?.status === 404

        if (!isNotFound) {
          throw error
        }

        const fallbackResponse = await apiClient.post<UploadAvatarResponse>(
          `/api/identity/users/${parsedPayload.userId}/upload-avatar`,
          formData,
          requestConfig
        )

        return uploadAvatarResponseSchema.parse(fallbackResponse.data)
      }
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        useAuthStore.getState().setUser(data)
      }

      queryClient.setQueryData<MeResponse>(['auth', 'me'], (previousData) => {
        if (!previousData) return previousData

        return {
          ...previousData,
          data
        }
      })

      options?.onSuccess?.(data)
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Upload avatar error:', error)
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
        await apiClient.post('/identity/auth/logout')
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
