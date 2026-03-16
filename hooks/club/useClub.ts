import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
  Club,
  getClubDetailResponseSchema,
  getMyClubsResponseSchema,
} from "@/validations/club/club"

type ClubStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED"

type UseGetMyClubsOptions = {
  status?: ClubStatus | null
}

export const useGetMyClubs = (options?: UseGetMyClubsOptions) => {
  return useQuery<Club[], AxiosError<ApiError>>({
    queryKey: ["my-clubs", options?.status],
    queryFn: async () => {
      const response = await apiClient.get("/clubs/myclub", {
        params: {
          ...(options?.status && { status: options.status }),
        },
      })
      const parsed = getMyClubsResponseSchema.parse(response.data)
      return parsed.data
    },
  })
}

export const useGetClubDetailByCode = (clubCode?: string) => {
  return useQuery<Club, AxiosError<ApiError>>({
    queryKey: ["club-detail-by-code", clubCode],
    enabled: !!clubCode,
    queryFn: async () => {
      const response = await apiClient.get(`/clubs/code/${clubCode}`);
      const parsed = getClubDetailResponseSchema.parse(response.data);
      return parsed.data;
    },
  });
};