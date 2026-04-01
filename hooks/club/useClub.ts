import { useMutation, useQuery } from "@tanstack/react-query"
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

type UploadTempClubImageResponse = {
  url: string
}

type UploadClubImageError = {
  message?: string
}

type UseUploadTempClubImageOptions = {
  onSuccess?: (data: UploadTempClubImageResponse) => void
  onError?: (error: AxiosError<UploadClubImageError>) => void
}

export const useGetMyClubs = (options?: UseGetMyClubsOptions) => {
  return useQuery<Club[], AxiosError<ApiError>>({
    queryKey: ["my-clubs", options?.status],
    queryFn: async () => {
      const response = await apiClient.get("/community/clubs/myclub", {
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
      const response = await apiClient.get(`/community/clubs/code/${clubCode}`);
      const parsed = getClubDetailResponseSchema.parse(response.data);
      return parsed.data;
    },
  });
};

export const useGetClubDetailById = (clubId?: string) => {
  return useQuery<Club, AxiosError<ApiError>>({
    queryKey: ["club-detail-by-id", clubId],
    enabled: !!clubId,
    queryFn: async () => {
      const response = await apiClient.get(`/community/clubs/${clubId}`);
      const parsed = getClubDetailResponseSchema.parse(response.data);
      return parsed.data;
    },
  });
};

export const useUploadTempClubImage = (
  options?: UseUploadTempClubImageOptions
) => {
  return useMutation<
    UploadTempClubImageResponse,
    AxiosError<UploadClubImageError>,
    File
  >({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await apiClient.post<UploadTempClubImageResponse>(
        "/community/clubs/upload-temp-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      return response.data
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      options?.onError?.(error)
    },
  })
}