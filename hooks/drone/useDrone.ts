import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CreateDroneRequest,
	CreateDroneResponse,
	DeleteDroneResponse,
	Drone,
	DroneStatusFilter,
	UpdateDroneRequest,
	UpdateDroneResponse,
	createDroneRequestSchema,
	createDroneResponseSchema,
	deleteDroneResponseSchema,
	getDroneDetailResponseSchema,
	getDronesResponseSchema,
	updateDroneRequestSchema,
	updateDroneResponseSchema,
} from "@/validations/drone/drone"

type UseGetDronesOptions = {
	status?: DroneStatusFilter
}

type CreateDroneVariables = {
	droneTypeId: string
	payload: CreateDroneRequest
}

type UseCreateDroneOptions = {
	onSuccess?: (data: CreateDroneResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

type UpdateDroneVariables = {
	droneId: string
	payload: UpdateDroneRequest
}

type UseUpdateDroneOptions = {
	onSuccess?: (data: UpdateDroneResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

type UseDeleteDroneOptions = {
	onSuccess?: (data: DeleteDroneResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

export const useGetDrones = (options?: UseGetDronesOptions) => {
	return useQuery<Drone[], AxiosError<ApiError>>({
		queryKey: ["drones", options?.status ?? "All"],
		queryFn: async () => {
			const response = await apiClient.get("/academy/drones", {
				params:
					options?.status && options.status !== "All"
						? { status: options.status }
						: undefined,
			})

			const parsed = getDronesResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetDroneDetail = (droneId?: string) => {
	return useQuery<Drone, AxiosError<ApiError>>({
		queryKey: ["drone-detail", droneId],
		enabled: Boolean(droneId),
		queryFn: async () => {
			if (!droneId) {
				throw new Error("droneId is required")
			}

			const response = await apiClient.get(`/academy/drones/${droneId}`)
			const parsed = getDroneDetailResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useCreateDrone = (options?: UseCreateDroneOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		CreateDroneResponse,
		AxiosError<ApiError>,
		CreateDroneVariables
	>({
		mutationFn: async ({ droneTypeId, payload }) => {
			const requestBody = createDroneRequestSchema.parse(payload)
			const response = await apiClient.post("/academy/drones", requestBody, {
				params: {
					droneTypeId,
				},
			})

			return createDroneResponseSchema.parse(response.data)
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: ["drones"] })
			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}

export const useUpdateDrone = (options?: UseUpdateDroneOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		UpdateDroneResponse,
		AxiosError<ApiError>,
		UpdateDroneVariables
	>({
		mutationFn: async ({ droneId, payload }) => {
			const requestBody = updateDroneRequestSchema.parse(payload)
			const response = await apiClient.put(
				`/academy/drones/${droneId}`,
				requestBody
			)

			return updateDroneResponseSchema.parse(response.data)
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: ["drones"] })
			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}

export const useDeleteDrone = (options?: UseDeleteDroneOptions) => {
	const queryClient = useQueryClient()

	return useMutation<DeleteDroneResponse, AxiosError<ApiError>, string>({
		mutationFn: async (droneId) => {
			const response = await apiClient.delete(`/academy/drones/${droneId}`)
			return deleteDroneResponseSchema.parse(response.data)
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: ["drones"] })
			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}

export type {
	CreateDroneVariables,
	UpdateDroneVariables,
	UseCreateDroneOptions,
	UseDeleteDroneOptions,
	UseGetDronesOptions,
	UseUpdateDroneOptions,
}
