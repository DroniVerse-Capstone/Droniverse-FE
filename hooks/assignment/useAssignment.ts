import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CreateAssignmentRequest,
	CreateAssignmentResponse,
	createAssignmentRequestSchema,
	createAssignmentResponseSchema,
	UpdateAssignmentRequest,
	UpdateAssignmentResponse,
	updateAssignmentRequestSchema,
	updateAssignmentResponseSchema,
	getAssignmentDetailResponseSchema,
	Assignment,
} from "@/validations/assignment/assignment"

type UseCreateAssignmentOptions = {
	onSuccess?: (data: CreateAssignmentResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

type UpdateAssignmentVariables = {
	assignmentId: string
	moduleID: string
	payload: UpdateAssignmentRequest
}

type UseUpdateAssignmentOptions = {
	onSuccess?: (data: UpdateAssignmentResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

export const useGetAssignmentDetail = (assignmentId?: string) => {
	return useQuery<Assignment, AxiosError<ApiError>>({
		queryKey: ["assignment-detail", assignmentId],
		enabled: Boolean(assignmentId),
		queryFn: async () => {
			if (!assignmentId) {
				throw new Error("assignmentId is required")
			}

			const response = await apiClient.get(`/academy/assignments/${assignmentId}`)
			const parsed = getAssignmentDetailResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useCreateAssignment = (options?: UseCreateAssignmentOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		CreateAssignmentResponse,
		AxiosError<ApiError>,
		CreateAssignmentRequest
	>({
		mutationFn: async (payload) => {
			const requestBody = createAssignmentRequestSchema.parse(payload)

			const response = await apiClient.post("/academy/assignments", requestBody)
			return createAssignmentResponseSchema.parse(response.data)
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

export const useUpdateAssignment = (options?: UseUpdateAssignmentOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		UpdateAssignmentResponse,
		AxiosError<ApiError>,
		UpdateAssignmentVariables
	>({
		mutationFn: async ({ assignmentId, payload }) => {
			const requestBody = updateAssignmentRequestSchema.parse(payload)

			const response = await apiClient.put(
				`/academy/assignments/${assignmentId}`,
				requestBody
			)

			return updateAssignmentResponseSchema.parse(response.data)
		},
		onSuccess: async (data, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["assignment-detail", variables.assignmentId],
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

export type { UseCreateAssignmentOptions }
export type { UpdateAssignmentVariables, UseUpdateAssignmentOptions }
