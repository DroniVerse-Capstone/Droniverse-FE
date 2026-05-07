import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CourseVersionFeedback,
	CourseVersionFeedbackDeleteParams,
	CourseVersionFeedbackParams,
	CourseVersionFeedbackUpdateParams,
	CreateCourseVersionFeedbackRequest,
	CreateCourseVersionFeedbackResponse,
	courseVersionFeedbackParamsSchema,
	courseVersionFeedbackDeleteParamsSchema,
	courseVersionFeedbackUpdateParamsSchema,
	createCourseVersionFeedbackRequestSchema,
	createCourseVersionFeedbackResponseSchema,
	deleteCourseVersionFeedbackResponseSchema,
	updateCourseVersionFeedbackRequestSchema,
	updateCourseVersionFeedbackResponseSchema,
	getCourseVersionFeedbacksResponseSchema,
	DeleteCourseVersionFeedbackResponse,
	UpdateCourseVersionFeedbackRequest,
	UpdateCourseVersionFeedbackResponse,
} from "@/validations/feedback/feedback"

type UseGetCourseVersionFeedbacksOptions = {
	enabled?: boolean
}

export const useGetCourseVersionFeedbacks = (
	courseId?: string,
	versionId?: string,
	options?: UseGetCourseVersionFeedbacksOptions
) => {
	return useQuery<CourseVersionFeedback[], AxiosError<ApiError>>({
		queryKey: ["course-version-feedbacks", courseId, versionId],
		enabled: (options?.enabled ?? true) && !!courseId && !!versionId,
		queryFn: async () => {
			const parsedParams = courseVersionFeedbackParamsSchema.parse({
				courseId,
				versionId,
			} as CourseVersionFeedbackParams)

			const response = await apiClient.get(
				`/academy/courses/${parsedParams.courseId}/versions/${parsedParams.versionId}/feedbacks`
			)

			const parsed = getCourseVersionFeedbacksResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

type CreateCourseVersionFeedbackVariables = {
	courseId: string
	versionId: string
	payload: CreateCourseVersionFeedbackRequest
}

type UpdateCourseVersionFeedbackVariables = {
	courseId: string
	versionId: string
	feedbackId: string
	payload: UpdateCourseVersionFeedbackRequest
}

type DeleteCourseVersionFeedbackVariables = {
	courseId: string
	versionId: string
	feedbackId: string
}

export const useCreateCourseVersionFeedback = () => {
	const queryClient = useQueryClient()

	return useMutation<
		CreateCourseVersionFeedbackResponse,
		AxiosError<ApiError>,
		CreateCourseVersionFeedbackVariables
	>({
		mutationFn: async ({ courseId, versionId, payload }) => {
			const parsedParams = courseVersionFeedbackParamsSchema.parse({
				courseId,
				versionId,
			} as CourseVersionFeedbackParams)
			const parsedPayload = createCourseVersionFeedbackRequestSchema.parse(payload)

			const response = await apiClient.post(
				`/academy/courses/${parsedParams.courseId}/versions/${parsedParams.versionId}/feedbacks`,
				parsedPayload
			)

			return createCourseVersionFeedbackResponseSchema.parse(response.data)
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["course-version-feedbacks", variables.courseId, variables.versionId],
			})
		},
	})
}

export const useUpdateCourseVersionFeedback = () => {
	const queryClient = useQueryClient()

	return useMutation<
		UpdateCourseVersionFeedbackResponse,
		AxiosError<ApiError>,
		UpdateCourseVersionFeedbackVariables
	>({
		mutationFn: async ({ courseId, versionId, feedbackId, payload }) => {
			const parsedParams = courseVersionFeedbackUpdateParamsSchema.parse({
				courseId,
				versionId,
				feedbackId,
			} as CourseVersionFeedbackUpdateParams)
			const parsedPayload = updateCourseVersionFeedbackRequestSchema.parse(payload)

			const response = await apiClient.put(
				`/academy/courses/${parsedParams.courseId}/versions/${parsedParams.versionId}/feedbacks/${parsedParams.feedbackId}`,
				parsedPayload
			)

			return updateCourseVersionFeedbackResponseSchema.parse(response.data)
		},
		onSuccess: (data, variables) => {
			queryClient.setQueryData<CourseVersionFeedback[]>(
				["course-version-feedbacks", variables.courseId, variables.versionId],
				(currentFeedbacks) =>
					currentFeedbacks?.map((feedback) =>
						feedback.feedbackID === variables.feedbackId ? data.data : feedback,
					),
			)

			queryClient.invalidateQueries({
				queryKey: ["course-version-feedbacks", variables.courseId, variables.versionId],
			})
		},
	})
}

export const useDeleteCourseVersionFeedback = () => {
	const queryClient = useQueryClient()

	return useMutation<
		DeleteCourseVersionFeedbackResponse,
		AxiosError<ApiError>,
		DeleteCourseVersionFeedbackVariables
	>({
		mutationFn: async ({ courseId, versionId, feedbackId }) => {
			const parsedParams = courseVersionFeedbackDeleteParamsSchema.parse({
				courseId,
				versionId,
				feedbackId,
			} as CourseVersionFeedbackDeleteParams)

			const response = await apiClient.delete(
				`/academy/courses/${parsedParams.courseId}/versions/${parsedParams.versionId}/feedbacks/${parsedParams.feedbackId}`
			)

			return deleteCourseVersionFeedbackResponseSchema.parse(response.data)
		},
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["course-version-feedbacks", variables.courseId, variables.versionId],
			})
		},
	})
}

export type { UseGetCourseVersionFeedbacksOptions }
export type { CreateCourseVersionFeedbackVariables }
export type { UpdateCourseVersionFeedbackVariables }
export type { DeleteCourseVersionFeedbackVariables }
