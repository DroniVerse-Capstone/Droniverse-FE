import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CreateUserEnrollmentRequest,
	CreateUserEnrollmentResponse,
	GetUserEnrollmentsData,
	GetUserEnrollmentsQuery,
	createUserEnrollmentRequestSchema,
	createUserEnrollmentResponseSchema,
	getUserEnrollmentsDataSchema,
} from "@/validations/enrollment/user-enrollment"

type UseGetUserEnrollmentsOptions = Omit<
	GetUserEnrollmentsQuery,
	"clubId" | "currentPage" | "pageSize"
> & {
	currentPage?: number
	pageSize?: number
}

export const useGetUserEnrollments = (
	clubId?: string,
	options?: UseGetUserEnrollmentsOptions
) => {
	return useQuery<GetUserEnrollmentsData, AxiosError<ApiError>>({
		queryKey: [
			"user-enrollments",
			clubId,
			options?.level,
			options?.courseSearchName,
			options?.enrollmentStatus,
			options?.currentPage,
			options?.pageSize,
		],
		queryFn: async () => {
			if (!clubId) {
				throw new Error("Club ID is required")
			}

			const params = new URLSearchParams()

			// if (options?.level) {
			// 	params.append("level", options.level)
			// }

			if (options?.courseSearchName) {
				params.append("courseSearchName", options.courseSearchName)
			}

			if (options?.enrollmentStatus) {
				params.append("enrollmentStatus", options.enrollmentStatus)
			}

			const currentPage = options?.currentPage || 1
			const pageSize = options?.pageSize || 5

			params.append("currentPage", String(currentPage))
			params.append("pageSize", String(pageSize))

			const response = await apiClient.get(
				`/academy/user/enrollments/me/clubs/${clubId}/courses`,
				{ params }
			)

			return getUserEnrollmentsDataSchema.parse(response.data.data)
		},
		enabled: !!clubId,
	})
}

export const useCreateUserEnrollment = () => {
	const queryClient = useQueryClient()

	return useMutation<
		CreateUserEnrollmentResponse,
		AxiosError<ApiError>,
		CreateUserEnrollmentRequest
	>({
		mutationFn: async (payload) => {
			const parsedPayload = createUserEnrollmentRequestSchema.parse(payload)

			const response = await apiClient.post(
				"/academy/user/enrollments",
				parsedPayload
			)

			return createUserEnrollmentResponseSchema.parse(response.data)
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["club-course-overview", variables.clubID, data.data.courseID],
			})
			queryClient.invalidateQueries({
				queryKey: ["user-enrollments", variables.clubID],
			})
		},
	})
}
