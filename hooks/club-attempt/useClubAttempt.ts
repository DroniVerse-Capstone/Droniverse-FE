"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
  ClubAttemptRequest,
  ClubAttemptResponse,
  ClubAttemptRequestItem,
  GetClubAttemptRequestsByClubData,
  UpdateClubAttemptRequestStatus,
  UpdateClubAttemptRequestStatusResponse,
  clubAttemptResponseSchema,
  getClubAttemptRequestsByClubResponseSchema,
  getMyClubAttemptRequestsResponseSchema,
  updateClubAttemptRequestStatusResponseSchema,
  updateClubAttemptRequestStatusSchema,
} from "@/validations/club-attempt/club-attempt";

type ClubAttemptRequestStatus = "PENDING" | "APPROVED" | "REJECT";

type UseGetMyClubAttemptRequestsOptions = {
  status?: ClubAttemptRequestStatus | null;
};

type UseGetClubAttemptRequestsByClubOptions = {
  status?: ClubAttemptRequestStatus | null;
  currentPage?: number;
  pageSize?: number;
};

export const useClubAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ClubAttemptResponse,
    AxiosError<ApiError>,
    ClubAttemptRequest
  >({
    mutationFn: async (data: ClubAttemptRequest) => {
      const response = await apiClient.post<ClubAttemptResponse>(
        "/community/clubs/attemption",
        data,
      );

      return clubAttemptResponseSchema.parse(response.data);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-club-attempt-requests"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-clubs"],
        }),
      ]);
    },
  });
};

export const useGetMyClubAttemptRequests = (
  options?: UseGetMyClubAttemptRequestsOptions,
) => {
  return useQuery<ClubAttemptRequestItem[], AxiosError<ApiError>>({
    queryKey: ["my-club-attempt-requests", options?.status],
    queryFn: async () => {
      const response = await apiClient.get(
        "/community/club-attempt-request/my-requests",
        {
          params: {
            ...(options?.status && { status: options.status }),
          },
        },
      );

      const parsed = getMyClubAttemptRequestsResponseSchema.parse(
        response.data,
      );
      return parsed.data;
    },
  });
};

export const useGetClubAttemptRequestsByClub = (
  clubID?: string,
  options?: UseGetClubAttemptRequestsByClubOptions,
) => {
  return useQuery<GetClubAttemptRequestsByClubData, AxiosError<ApiError>>({
    queryKey: [
      "club-attempt-requests-by-club",
      clubID,
      options?.status,
      options?.currentPage,
      options?.pageSize,
    ],
    enabled: !!clubID,
    queryFn: async () => {
      const response = await apiClient.get(
        `/community/club-attempt-request/${clubID}`,
        {
          params: {
            ...(options?.status && { Status: options.status }),
            CurrentPage: options?.currentPage ?? 1,
            PageSize: options?.pageSize ?? 5,
          },
        },
      );

      const parsed = getClubAttemptRequestsByClubResponseSchema.parse(
        response.data,
      );

      return parsed.data;
    },
  });
};

export const useUpdateClubAttemptRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateClubAttemptRequestStatusResponse,
    AxiosError<ApiError>,
    { id: string; data: UpdateClubAttemptRequestStatus }
  >({
    mutationFn: async ({ id, data }) => {
      const payload = updateClubAttemptRequestStatusSchema.parse(data);

      const response = await apiClient.put(
        `/community/club-attempt-request/${id}/status`,
        payload,
      );

      return updateClubAttemptRequestStatusResponseSchema.parse(response.data);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-club-attempt-requests"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["club-attempt-requests-by-club"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["club-participations"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-clubs"],
        }),
      ]);
    },
  });
};
