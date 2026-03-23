import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CourseVersion,
	CreateCourseVersionRequest,
	createCourseVersionRequestSchema,
	createCourseVersionResponseSchema,
} from "@/validations/course-version/course-version"

type CreateCourseVersionVariables = {
	courseId: string
	payload: CreateCourseVersionRequest
}

export const useCreateCourseVersion = () => {
	const queryClient = useQueryClient()

	return useMutation<
		CourseVersion,
		AxiosError<ApiError>,
		CreateCourseVersionVariables
	>({
		mutationFn: async ({ courseId, payload }) => {
			const requestBody = createCourseVersionRequestSchema.parse(payload)
			const response = await apiClient.post(
				`/academy/courses/${courseId}/versions`,
				requestBody
			)

			const parsed = createCourseVersionResponseSchema.parse(response.data)
			return parsed.data
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["courses"] })
		},
	})
}

export type { CreateCourseVersionVariables }
