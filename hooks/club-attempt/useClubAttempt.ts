"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
  ClubAttemptRequest,
  ClubAttemptResponse,
  ClubAttemptRequestItem,
  clubAttemptResponseSchema,
  getMyClubAttemptRequestsResponseSchema,
} from "@/validations/club-attempt/club-attempt";

type ClubAttemptRequestStatus = "PENDING" | "APPROVED" | "REJECT";

type UseGetMyClubAttemptRequestsOptions = {
  status?: ClubAttemptRequestStatus | null;
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
        "/clubs/attemption",
        data
      );

      return clubAttemptResponseSchema.parse(response.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["my-club-attempt-requests"],
      });
    },
  });
};

export const useGetMyClubAttemptRequests = (
  options?: UseGetMyClubAttemptRequestsOptions,
) => {
  return useQuery<ClubAttemptRequestItem[], AxiosError<ApiError>>({
    queryKey: ["my-club-attempt-requests", options?.status],
    queryFn: async () => {
      const response = await apiClient.get("/club-attempt-request/my-requests", {
        params: {
          ...(options?.status && { status: options.status }),
        },
      });

      const parsed = getMyClubAttemptRequestsResponseSchema.parse(response.data);
      return parsed.data;
    },
  });
};

