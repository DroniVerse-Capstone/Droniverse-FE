import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
  Club,
  GetAllClubsData,
  getAllClubsResponseSchema,
  getClubDetailResponseSchema,
  getMyClubsResponseSchema,
  UpdateClubStatus,
  UpdateClubStatusResponse,
  updateClubStatusResponseSchema,
  updateClubStatusSchema,
} from "@/validations/club/club"

type ClubStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED"

type UseGetMyClubsOptions = {
  status?: ClubStatus | null
}

type UseGetAllClubsOptions = {
  clubName?: string
  clubStatus?: ClubStatus | null
  currentPage?: number
  pageSize?: number
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

export const useGetAllClubs = (options?: UseGetAllClubsOptions) => {
  return useQuery<GetAllClubsData, AxiosError<ApiError>>({
    queryKey: [
      "all-clubs",
      options?.clubName,
      options?.clubStatus,
      options?.currentPage,
      options?.pageSize,
    ],
    queryFn: async () => {
      const response = await apiClient.get("/community/clubs", {
        params: {
          ...(options?.clubName && { ClubName: options.clubName }),
          ...(options?.clubStatus && { ClubStatus: options.clubStatus }),
          CurrentPage: options?.currentPage ?? 1,
          PageSize: options?.pageSize ?? 5,
        },
      })

      const parsed = getAllClubsResponseSchema.parse(response.data)
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

export const useUpdateClubStatus = () => {
  const queryClient = useQueryClient()

  return useMutation<
    UpdateClubStatusResponse,
    AxiosError<ApiError>,
    { id: string; data: UpdateClubStatus }
  >({
    mutationFn: async ({ id, data }) => {
      const payload = updateClubStatusSchema.parse(data)

      const response = await apiClient.put(
        `/community/clubs/${id}/status`,
        payload
      )

      return updateClubStatusResponseSchema.parse(response.data)
    },
    onSuccess: async (response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-clubs"] }),
        queryClient.invalidateQueries({ queryKey: ["all-clubs"] }),
        queryClient.invalidateQueries({
          queryKey: ["club-detail-by-id", variables.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["club-detail-by-code", response.data.clubCode],
        }),
      ])
    },
  })
}