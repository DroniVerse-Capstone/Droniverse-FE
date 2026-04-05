import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
  Category,
  CreateCategoryRequest,
  CreateCategoryResponse,
  DeleteCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  createCategoryRequestSchema,
  createCategoryResponseSchema,
  deleteCategoryResponseSchema,
  getCategoriesResponseSchema,
  updateCategoryRequestSchema,
  updateCategoryResponseSchema,
} from "@/validations/category/category"

type UseCreateCategoryOptions = {
  onSuccess?: (data: CreateCategoryResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
}

type UpdateCategoryVariables = {
  categoryId: string
  payload: UpdateCategoryRequest
}

type UseUpdateCategoryOptions = {
  onSuccess?: (data: UpdateCategoryResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
}

type UseDeleteCategoryOptions = {
  onSuccess?: (data: DeleteCategoryResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
}

export const useGetCategories = () => {
  return useQuery<Category[], AxiosError<ApiError>>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get("/community/categories")
      const parsed = getCategoriesResponseSchema.parse(response.data)
      return parsed.data
    },
  })
}

export const useCreateCategory = (options?: UseCreateCategoryOptions) => {
  const queryClient = useQueryClient()

  return useMutation<
    CreateCategoryResponse,
    AxiosError<ApiError>,
    CreateCategoryRequest
  >({
    mutationFn: async (payload) => {
      const requestBody = createCategoryRequestSchema.parse(payload)
      const response = await apiClient.post("/community/categories", requestBody)
      return createCategoryResponseSchema.parse(response.data)
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      options?.onError?.(error)
    },
  })
}

export const useUpdateCategory = (options?: UseUpdateCategoryOptions) => {
  const queryClient = useQueryClient()

  return useMutation<
    UpdateCategoryResponse,
    AxiosError<ApiError>,
    UpdateCategoryVariables
  >({
    mutationFn: async ({ categoryId, payload }) => {
      const requestBody = updateCategoryRequestSchema.parse(payload)
      const response = await apiClient.put(
        `/community/categories/${categoryId}`,
        requestBody
      )

      return updateCategoryResponseSchema.parse(response.data)
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      options?.onError?.(error)
    },
  })
}

export const useDeleteCategory = (options?: UseDeleteCategoryOptions) => {
  const queryClient = useQueryClient()

  return useMutation<DeleteCategoryResponse, AxiosError<ApiError>, string>({
    mutationFn: async (categoryId) => {
      const response = await apiClient.delete(`/community/categories/${categoryId}`)
      return deleteCategoryResponseSchema.parse(response.data)
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      options?.onError?.(error)
    },
  })
}

export type {
  UpdateCategoryVariables,
  UseCreateCategoryOptions,
  UseDeleteCategoryOptions,
  UseUpdateCategoryOptions,
}