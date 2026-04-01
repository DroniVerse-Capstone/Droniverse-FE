import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CreateTheoryRequest,
	CreateTheoryResponse,
	Theory,
	UpdateTheoryRequest,
	UpdateTheoryResponse,
	createTheoryRequestSchema,
	createTheoryResponseSchema,
	getTheoryDetailResponseSchema,
	updateTheoryRequestSchema,
	updateTheoryResponseSchema,
} from "@/validations/theory/theory"

type UseCreateTheoryOptions = {
	onSuccess?: (data: CreateTheoryResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

type UpdateTheoryVariables = {
	theoryId: string
	moduleID: string
	payload: UpdateTheoryRequest
}

type UseUpdateTheoryOptions = {
	onSuccess?: (data: UpdateTheoryResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

export const useGetTheoryDetail = (theoryId?: string) => {
	return useQuery<Theory, AxiosError<ApiError>>({
		queryKey: ["theory-detail", theoryId],
		enabled: Boolean(theoryId),
		queryFn: async () => {
			if (!theoryId) {
				throw new Error("theoryId is required")
			}

			const response = await apiClient.get(`/academy/theories/${theoryId}`)
			const parsed = getTheoryDetailResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useCreateTheory = (options?: UseCreateTheoryOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		CreateTheoryResponse,
		AxiosError<ApiError>,
		CreateTheoryRequest
	>({
		mutationFn: async (payload) => {
			const requestBody = createTheoryRequestSchema.parse(payload)

			const response = await apiClient.post("/academy/theories", requestBody)
			return createTheoryResponseSchema.parse(response.data)
		},
		onSuccess: async (data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["lessons", variables.moduleID],
			})

			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}

export const useUpdateTheory = (options?: UseUpdateTheoryOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		UpdateTheoryResponse,
		AxiosError<ApiError>,
		UpdateTheoryVariables
	>({
		mutationFn: async ({ theoryId, payload }) => {
			const requestBody = updateTheoryRequestSchema.parse(payload)

			const response = await apiClient.put(
				`/academy/theories/${theoryId}`,
				requestBody
			)

			return updateTheoryResponseSchema.parse(response.data)
		},
		onSuccess: async (data, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["theory-detail", variables.theoryId],
				}),
				queryClient.invalidateQueries({
					queryKey: ["lessons", variables.moduleID],
				}),
			])

			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}

export type {
	UpdateTheoryVariables,
	UseCreateTheoryOptions,
	UseUpdateTheoryOptions,
}
