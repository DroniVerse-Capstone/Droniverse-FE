import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	getUserAssignmentAttemptsResponseSchema,
	GetUserAssignmentAttemptsResponse,
} from "@/validations/assignment/user-assignment"

export const useGetUserAssignmentAttempts = (
	clubId: string,
	pageIndex: number = 1,
	pageSize: number = 10
) => {
	return useQuery<GetUserAssignmentAttemptsResponse, AxiosError<ApiError>>({
		queryKey: ["user-assignment-attempts", clubId, pageIndex, pageSize],
		enabled: Boolean(clubId),
		queryFn: async () => {
			const response = await apiClient.get(
				`/academy/manager/assignments/submissions/attempts/club/${clubId}`,
				{
					params: {
						pageIndex,
						pageSize,
					},
				}
			)
			return getUserAssignmentAttemptsResponseSchema.parse(response.data)
		},
	})
}
