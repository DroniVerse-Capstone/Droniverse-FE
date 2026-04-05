import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import { CreateDroneTypeRequest, createDroneTypeRequestSchema, CreateDroneTypeResponse, createDroneTypeResponseSchema, DeleteDroneTypeResponse, deleteDroneTypeResponseSchema, DroneType, getDroneTypesResponseSchema, UpdateDroneTypeRequest, updateDroneTypeRequestSchema, UpdateDroneTypeResponse, updateDroneTypeResponseSchema } from "@/validations/drone-type/drone-type"


type UseCreateDroneTypeOptions = {
  onSuccess?: (data: CreateDroneTypeResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
}

type UpdateDroneTypeVariables = {
  droneTypeId: string
  payload: UpdateDroneTypeRequest
}

type UseUpdateDroneTypeOptions = {
  onSuccess?: (data: UpdateDroneTypeResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
}

type UseDeleteDroneTypeOptions = {
  onSuccess?: (data: DeleteDroneTypeResponse) => void
  onError?: (error: AxiosError<ApiError>) => void
}

export const useGetDroneTypes = () => {
  return useQuery<DroneType[], AxiosError<ApiError>>({
    queryKey: ["drone-types"],
    queryFn: async () => {
      const response = await apiClient.get("/academy/drone-types")
      const parsed = getDroneTypesResponseSchema.parse(response.data)
      return parsed.data
    },
  })
}

export const useCreateDroneType = (options?: UseCreateDroneTypeOptions) => {
  const queryClient = useQueryClient()

  return useMutation<
    CreateDroneTypeResponse,
    AxiosError<ApiError>,
    CreateDroneTypeRequest
  >({
    mutationFn: async (payload) => {
      const requestBody = createDroneTypeRequestSchema.parse(payload)
      const response = await apiClient.post("/academy/drone-types", requestBody)
      return createDroneTypeResponseSchema.parse(response.data)
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["drone-types"] })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      options?.onError?.(error)
    },
  })
}

export const useUpdateDroneType = (options?: UseUpdateDroneTypeOptions) => {
  const queryClient = useQueryClient()

  return useMutation<
    UpdateDroneTypeResponse,
    AxiosError<ApiError>,
    UpdateDroneTypeVariables
  >({
    mutationFn: async ({ droneTypeId, payload }) => {
      const requestBody = updateDroneTypeRequestSchema.parse(payload)
      const response = await apiClient.put(
        `/academy/drone-types/${droneTypeId}`,
        requestBody
      )

      return updateDroneTypeResponseSchema.parse(response.data)
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["drone-types"] })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      options?.onError?.(error)
    },
  })
}

export const useDeleteDroneType = (options?: UseDeleteDroneTypeOptions) => {
  const queryClient = useQueryClient()

  return useMutation<DeleteDroneTypeResponse, AxiosError<ApiError>, string>({
    mutationFn: async (droneTypeId) => {
      const response = await apiClient.delete(`/academy/drone-types/${droneTypeId}`)
      return deleteDroneTypeResponseSchema.parse(response.data)
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["drone-types"] })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      options?.onError?.(error)
    },
  })
}

export type {
  UpdateDroneTypeVariables,
  UseCreateDroneTypeOptions,
  UseDeleteDroneTypeOptions,
  UseUpdateDroneTypeOptions,
}