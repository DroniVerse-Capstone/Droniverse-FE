import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	DeleteLessonResponse,
	ImportLabLessonRequest,
	ImportLabLessonResponse,
	Lesson,
	deleteLessonResponseSchema,
	getLessonsResponseSchema,
	importLabLessonRequestSchema,
	importLabLessonResponseSchema,
} from "@/validations/lesson/lesson"

type UseGetLessonsOptions = {
	moduleId?: string
}

type DeleteLessonVariables = {
	moduleId: string
	lessonId: string
}

type UseDeleteLessonOptions = {
	onSuccess?: (data: DeleteLessonResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

type ImportLabLessonVariables = {
	labId: string
	payload: ImportLabLessonRequest
}

type UseImportLabLessonOptions = {
	onSuccess?: (data: ImportLabLessonResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

export const useGetLessons = (options?: UseGetLessonsOptions) => {
	return useQuery<Lesson[], AxiosError<ApiError>>({
		queryKey: ["lessons", options?.moduleId],
		enabled: Boolean(options?.moduleId),
		queryFn: async () => {
			if (!options?.moduleId) {
				throw new Error("moduleId is required")
			}

			const response = await apiClient.get(
				`/academy/modules/${options.moduleId}/lessons`
			)

			const parsed = getLessonsResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useDeleteLesson = (options?: UseDeleteLessonOptions) => {
	const queryClient = useQueryClient()

	return useMutation<DeleteLessonResponse, AxiosError<ApiError>, DeleteLessonVariables>({
		mutationFn: async ({ moduleId, lessonId }) => {
			const response = await apiClient.delete(
				`/academy/modules/${moduleId}/lessons/${lessonId}`
			)

			return deleteLessonResponseSchema.parse(response.data)
		},
		onSuccess: async (data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["lessons", variables.moduleId],
			})

			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}

export const useImportLabLesson = (options?: UseImportLabLessonOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		ImportLabLessonResponse,
		AxiosError<ApiError>,
		ImportLabLessonVariables
	>({
		mutationFn: async ({ labId, payload }) => {
			const requestBody = importLabLessonRequestSchema.parse(payload)
			const response = await apiClient.post(
				`/academy/labs/${labId}/lessons`,
				requestBody
			)

			return importLabLessonResponseSchema.parse(response.data)
		},
		onSuccess: async (data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["lessons", variables.payload.moduleID],
			})

			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}

export type {
	DeleteLessonVariables,
	ImportLabLessonVariables,
	UseDeleteLessonOptions,
	UseGetLessonsOptions,
	UseImportLabLessonOptions,
}
