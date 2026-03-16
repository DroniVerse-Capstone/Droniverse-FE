"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
  ClubAttemptRequest,
  ClubAttemptResponse,
  clubAttemptResponseSchema,
} from "@/validations/club-attempt/club-attempt";

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
        queryKey: ["my-clubs"],
      });
    },
  });
};