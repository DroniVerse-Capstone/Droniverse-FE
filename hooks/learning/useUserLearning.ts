import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CheckUserLessonExistsParams,
	CompleteUserLessonData,
	CompleteUserLessonParams,
	CreateUserLessonDataParams,
	GetUserLabDetailData,
	GetUserLabDetailParams,
	GetUserQuizAttemptReviewData,
	GetUserQuizAttemptReviewParams,
	GetUserQuizDetailData,
	GetUserQuizDetailParams,
	GetUserQuizQuestionsParams,
	SubmitUserQuizData,
	SubmitUserQuizParams,
	UserLesson,
	UserQuizQuestion,
	checkUserLessonExistsParamsSchema,
	checkUserLessonExistsResponseSchema,
	completeUserLessonParamsSchema,
	completeUserLessonResponseSchema,
	createUserLessonDataParamsSchema,
	createUserLessonDataResponseSchema,
	getUserLabDetailParamsSchema,
	getUserLabDetailResponseSchema,
	getUserQuizAttemptReviewParamsSchema,
	getUserQuizAttemptReviewResponseSchema,
	getUserQuizDetailParamsSchema,
	getUserQuizDetailResponseSchema,
	getUserQuizQuestionsParamsSchema,
	getUserQuizQuestionsResponseSchema,
	submitUserQuizParamsSchema,
	submitUserQuizResponseSchema,
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

export const useCompleteUserLesson = () => {
	const queryClient = useQueryClient()

	return useMutation<
		CompleteUserLessonData,
		AxiosError<ApiError>,
		CompleteUserLessonParams
	>({
		mutationFn: async (params) => {
			const parsedParams = completeUserLessonParamsSchema.parse(params)

			const response = await apiClient.post(
				`/academy/user/enrollments/${parsedParams.enrollmentId}/lessons/${parsedParams.lessonId}/complete`
			)

			const parsed = completeUserLessonResponseSchema.parse(response.data)
			return parsed.data
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["user-learning-path", variables.enrollmentId],
			})
			queryClient.invalidateQueries({
				queryKey: ["user-lesson-exists", variables.enrollmentId, variables.lessonId],
			})
		},
	})
}

export const useGetUserQuizDetail = (params?: GetUserQuizDetailParams) => {
	return useQuery<GetUserQuizDetailData, AxiosError<ApiError>>({
		queryKey: ["user-quiz-detail", params?.enrollmentId, params?.quizId],
		enabled: !!params?.enrollmentId && !!params?.quizId,
		queryFn: async () => {
			const parsedParams = getUserQuizDetailParamsSchema.parse(params)

			const response = await apiClient.get(
				`/academy/user/enrollments/${parsedParams.enrollmentId}/quizzes/${parsedParams.quizId}`
			)

			const parsed = getUserQuizDetailResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetUserQuizQuestions = (
	params?: GetUserQuizQuestionsParams
) => {
	return useQuery<UserQuizQuestion[], AxiosError<ApiError>>({
		queryKey: ["user-quiz-questions", params?.enrollmentId, params?.quizId],
		enabled: !!params?.enrollmentId && !!params?.quizId,
		queryFn: async () => {
			const parsedParams = getUserQuizQuestionsParamsSchema.parse(params)

			const response = await apiClient.get(
				`/academy/user/enrollments/${parsedParams.enrollmentId}/quizzes/${parsedParams.quizId}/questions`
			)

			const parsed = getUserQuizQuestionsResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetUserQuizAttemptReview = (
	params?: GetUserQuizAttemptReviewParams
) => {
	return useQuery<GetUserQuizAttemptReviewData, AxiosError<ApiError>>({
		queryKey: ["user-quiz-attempt-review", params?.enrollmentId, params?.quizId],
		enabled: !!params?.enrollmentId && !!params?.quizId,
		queryFn: async () => {
			const parsedParams = getUserQuizAttemptReviewParamsSchema.parse(params)

			const response = await apiClient.get(
				`/academy/user/enrollments/${parsedParams.enrollmentId}/quizzes/${parsedParams.quizId}/attempts/latest/review`
			)

			const parsed = getUserQuizAttemptReviewResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useSubmitUserQuiz = () => {
	const queryClient = useQueryClient()

	return useMutation<SubmitUserQuizData, AxiosError<ApiError>, SubmitUserQuizParams>({
		mutationFn: async (params) => {
			const parsedParams = submitUserQuizParamsSchema.parse(params)

			const response = await apiClient.post(
				`/academy/user/enrollments/${parsedParams.enrollmentId}/quizzes/${parsedParams.quizId}/submit`,
				{
					answers: parsedParams.answers,
				}
			)

			const parsed = submitUserQuizResponseSchema.parse(response.data)
			return parsed.data
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["user-learning-path", variables.enrollmentId],
			})
			queryClient.invalidateQueries({
				queryKey: ["user-quiz-detail", variables.enrollmentId, variables.quizId],
			})
			queryClient.invalidateQueries({
				queryKey: ["user-quiz-attempt-review", variables.enrollmentId, variables.quizId],
			})
		},
	})
}

export const useGetUserLabDetail = (params?: GetUserLabDetailParams) => {
	return useQuery<GetUserLabDetailData, AxiosError<ApiError>>({
		queryKey: ["user-lab-detail", params?.enrollmentId, params?.labId],
		enabled: !!params?.enrollmentId && !!params?.labId,
		queryFn: async () => {
			const parsedParams = getUserLabDetailParamsSchema.parse(params)

			const response = await apiClient.get(
				`/academy/user/enrollments/${parsedParams.enrollmentId}/labs/${parsedParams.labId}`
			)

			const parsed = getUserLabDetailResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}
