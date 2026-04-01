import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CreateQuizRequest,
	CreateQuizResponse,
	Quiz,
	UpdateQuizRequest,
	UpdateQuizResponse,
	createQuizRequestSchema,
	createQuizResponseSchema,
	getQuizDetailResponseSchema,
	updateQuizRequestSchema,
	updateQuizResponseSchema,
} from "@/validations/quiz/quiz"

type UseCreateQuizOptions = {
	onSuccess?: (data: CreateQuizResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

type UpdateQuizVariables = {
	quizId: string
	payload: UpdateQuizRequest
    moduleID: string 
}

type UseUpdateQuizOptions = {
	onSuccess?: (data: UpdateQuizResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

export const useGetQuizDetail = (quizId?: string) => {
	return useQuery<Quiz, AxiosError<ApiError>>({
		queryKey: ["quiz-detail", quizId],
		enabled: Boolean(quizId),
		queryFn: async () => {
			if (!quizId) {
				throw new Error("quizId is required")
			}

			const response = await apiClient.get(`/academy/quizzes/${quizId}`)
			const parsed = getQuizDetailResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useCreateQuiz = (options?: UseCreateQuizOptions) => {
	const queryClient = useQueryClient()

	return useMutation<CreateQuizResponse, AxiosError<ApiError>, CreateQuizRequest>({
		mutationFn: async (payload) => {
			const requestBody = createQuizRequestSchema.parse(payload)

			const response = await apiClient.post("/academy/quizzes", requestBody)
			return createQuizResponseSchema.parse(response.data)
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

export const useUpdateQuiz = (options?: UseUpdateQuizOptions) => {
	const queryClient = useQueryClient()

	return useMutation<UpdateQuizResponse, AxiosError<ApiError>, UpdateQuizVariables>({
		mutationFn: async ({ quizId, payload }) => {
			const requestBody = updateQuizRequestSchema.parse(payload)

			const response = await apiClient.put(`/academy/quizzes/${quizId}`, requestBody)
			return updateQuizResponseSchema.parse(response.data)
		},
		onSuccess: async (data, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["quiz-detail", variables.quizId],
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

export type { UpdateQuizVariables, UseCreateQuizOptions, UseUpdateQuizOptions }
