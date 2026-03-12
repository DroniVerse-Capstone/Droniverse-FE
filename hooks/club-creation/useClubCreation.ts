"use client"

import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
  ClubCreationRequest,
  ClubCreationResponse,
  clubCreationResponseSchema,
} from "@/validations/club-creation/club-creation"

export const useClubCreation = () => {
  return useMutation<
    ClubCreationResponse,
    AxiosError<ApiError>,
    ClubCreationRequest
  >({
    mutationFn: async (data: ClubCreationRequest) => {
      const response = await apiClient.post<ClubCreationResponse>(
        "/club-creation-request",
        data
      )

      return clubCreationResponseSchema.parse(response.data)
    },
  })
}