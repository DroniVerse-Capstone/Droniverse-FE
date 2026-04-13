import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CheckUserLessonExistsParams,
	CreateUserLessonDataParams,
	UserLesson,
	checkUserLessonExistsParamsSchema,
	checkUserLessonExistsResponseSchema,
	createUserLessonDataParamsSchema,
	createUserLessonDataResponseSchema,
	UserLearningPath,
	getUserLearningPathResponseSchema,
} from "@/validations/learning/user-learning"

export const useGetUserLearningPath = (enrollmentId?: string) => {
	return useQuery<UserLearningPath, AxiosError<ApiError>>({
		queryKey: ["user-learning-path", enrollmentId],
		queryFn: async () => {
			if (!enrollmentId) {
				throw new Error("Enrollment ID is required")
			}

			const response = await apiClient.get(
				`/academy/user/enrollments/${enrollmentId}/learning-path`
			)

			const parsed = getUserLearningPathResponseSchema.parse(response.data)
			return parsed.data
		},
		enabled: !!enrollmentId,
	})
}

export const useCreateUserLessonData = () => {
	return useMutation<
		UserLesson,
		AxiosError<ApiError>,
		CreateUserLessonDataParams
	>({
		mutationFn: async (params) => {
			const parsedParams = createUserLessonDataParamsSchema.parse(params)

			const response = await apiClient.post(
				`/academy/user/enrollments/${parsedParams.enrollmentId}/lessons/${parsedParams.lessonId}`
			)

			const parsed = createUserLessonDataResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useCheckUserLessonExists = (
	params?: CheckUserLessonExistsParams
) => {
	return useQuery<boolean, AxiosError<ApiError>>({
		queryKey: [
			"user-lesson-exists",
			params?.enrollmentId,
			params?.lessonId,
		],
		enabled: !!params?.enrollmentId && !!params?.lessonId,
		queryFn: async () => {
			const parsedParams = checkUserLessonExistsParamsSchema.parse(params)

			const response = await apiClient.get(
				`/academy/user/enrollments/${parsedParams.enrollmentId}/lessons/${parsedParams.lessonId}/exists`
			)

			const parsed = checkUserLessonExistsResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}
