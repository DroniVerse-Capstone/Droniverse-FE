import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
    getUserAssignmentAttemptsResponseSchema,
    GetUserAssignmentAttemptsResponse,
    ReviewUserAssignmentRequest,
    ReviewUserAssignmentResponse,
    reviewUserAssignmentRequestSchema,
    reviewUserAssignmentResponseSchema,
  UserAssignmentStatus,
} from "@/validations/assignment/user-assignment"

export const useGetUserAssignmentAttempts = (
    clubId: string,
    pageIndex: number = 1,
  pageSize: number = 10,
  status?: UserAssignmentStatus
) => {
    return useQuery<GetUserAssignmentAttemptsResponse, AxiosError<ApiError>>({
    queryKey: ["user-assignment-attempts", clubId, pageIndex, pageSize, status ?? "ALL"],
        enabled: Boolean(clubId),
        queryFn: async () => {
            const response = await apiClient.get(
                `/academy/manager/assignments/submissions/attempts/club/${clubId}`,
                {
                    params: {
                        pageIndex,
                        pageSize,
            status,
                    },
                }
            )

            return getUserAssignmentAttemptsResponseSchema.parse(response.data)
        },
    })
}

type ReviewUserAssignmentVariables = {
    userAssignmentId: string
    data: ReviewUserAssignmentRequest
}

export const useReviewUserAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ReviewUserAssignmentResponse,
    AxiosError<ApiError>,
    ReviewUserAssignmentVariables
  >({
    mutationFn: async ({ userAssignmentId, data }) => {
      const requestBody = reviewUserAssignmentRequestSchema.parse(data)

      const response = await apiClient.post(
        `/academy/manager/assignments/submissions/${userAssignmentId}/review`,
        requestBody
      )

      return reviewUserAssignmentResponseSchema.parse(response.data)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user-assignment-attempts"],
      })
    },
  })
}
