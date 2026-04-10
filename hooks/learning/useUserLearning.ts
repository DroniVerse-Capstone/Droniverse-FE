import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
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
