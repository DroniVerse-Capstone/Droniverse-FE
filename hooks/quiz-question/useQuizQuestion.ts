import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CreateQuizQuestionRequest,
	CreateQuizQuestionResponse,
	DeleteQuizQuestionResponse,
	QuizQuestion,
	UpdateQuizQuestionRequest,
	UpdateQuizQuestionResponse,
	createQuizQuestionRequestSchema,
	createQuizQuestionResponseSchema,
	deleteQuizQuestionResponseSchema,
	getQuizQuestionsResponseSchema,
	updateQuizQuestionRequestSchema,
	updateQuizQuestionResponseSchema,
} from "@/validations/quiz-question/quiz-question"

type CreateQuizQuestionVariables = {
	quizId: string
	payload: CreateQuizQuestionRequest
}

type UseCreateQuizQuestionOptions = {
	onSuccess?: (data: CreateQuizQuestionResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

type UpdateQuizQuestionVariables = {
	quizId: string
	questionId: string
	payload: UpdateQuizQuestionRequest
}

type UseUpdateQuizQuestionOptions = {
	onSuccess?: (data: UpdateQuizQuestionResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

type DeleteQuizQuestionVariables = {
	quizId: string
	questionId: string
}

type UseDeleteQuizQuestionOptions = {
	onSuccess?: (data: DeleteQuizQuestionResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

export const useGetQuizQuestions = (quizId?: string) => {
	return useQuery<QuizQuestion[], AxiosError<ApiError>>({
		queryKey: ["quiz-questions", quizId],
		enabled: Boolean(quizId),
		queryFn: async () => {
			if (!quizId) {
				throw new Error("quizId is required")
			}

			const response = await apiClient.get(`/academy/quizzes/${quizId}/questions`)
			const parsed = getQuizQuestionsResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useCreateQuizQuestion = (options?: UseCreateQuizQuestionOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		CreateQuizQuestionResponse,
		AxiosError<ApiError>,
		CreateQuizQuestionVariables
	>({
		mutationFn: async ({ quizId, payload }) => {
			const requestBody = createQuizQuestionRequestSchema.parse(payload)

			const response = await apiClient.post(
				`/academy/quizzes/${quizId}/questions`,
				requestBody
			)

			return createQuizQuestionResponseSchema.parse(response.data)
		},
		onSuccess: async (data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["quiz-questions", variables.quizId],
			})

			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}

export const useUpdateQuizQuestion = (options?: UseUpdateQuizQuestionOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		UpdateQuizQuestionResponse,
		AxiosError<ApiError>,
		UpdateQuizQuestionVariables
	>({
		mutationFn: async ({ quizId, questionId, payload }) => {
			const requestBody = updateQuizQuestionRequestSchema.parse(payload)

			const response = await apiClient.put(
				`/academy/quizzes/${quizId}/questions/${questionId}`,
				requestBody
			)

			return updateQuizQuestionResponseSchema.parse(response.data)
		},
		onSuccess: async (data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["quiz-questions", variables.quizId],
			})

			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}

export const useDeleteQuizQuestion = (options?: UseDeleteQuizQuestionOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		DeleteQuizQuestionResponse,
		AxiosError<ApiError>,
		DeleteQuizQuestionVariables
	>({
		mutationFn: async ({ quizId, questionId }) => {
			const response = await apiClient.delete(
				`/academy/quizzes/${quizId}/questions/${questionId}`
			)

			return deleteQuizQuestionResponseSchema.parse(response.data)
		},
		onSuccess: async (data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["quiz-questions", variables.quizId],
			})

			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}

export type {
	CreateQuizQuestionVariables,
	DeleteQuizQuestionVariables,
	UpdateQuizQuestionVariables,
	UseCreateQuizQuestionOptions,
	UseDeleteQuizQuestionOptions,
	UseUpdateQuizQuestionOptions,
}
