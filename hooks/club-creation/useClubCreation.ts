"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
  ClubCreationRequest,
  ClubCreationResponse,
  clubCreationResponseSchema,
  ClubCreationRequestItem,
  getMyClubCreationRequestsResponseSchema,
  clubCreationRequestDetailResponseSchema,
  UpdateClubCreationRequestResponse,
  UpdateClubCreationRequest,
  updateClubCreationRequestResponseSchema,
  UpdateClubCreationRequestStatusResponse,
  UpdateClubCreationRequestStatus,
  updateClubCreationRequestStatusResponseSchema,
} from "@/validations/club-creation/club-creation";

type ClubCreationRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCEL";

type UseGetMyClubCreationRequestsOptions = {
  status?: ClubCreationRequestStatus | null;
};

export const useClubCreation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ClubCreationResponse,
    AxiosError<ApiError>,
    ClubCreationRequest
  >({
    mutationFn: async (data: ClubCreationRequest) => {
      const response = await apiClient.post<ClubCreationResponse>(
        "/club-creation-request",
        data,
      );

      return clubCreationResponseSchema.parse(response.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["my-club-creation-requests"],
      });
    },
  });
};

export const useGetMyClubCreationRequests = (
  options?: UseGetMyClubCreationRequestsOptions,
) => {
  return useQuery<ClubCreationRequestItem[], AxiosError<ApiError>>({
    queryKey: ["my-club-creation-requests", options?.status],
    queryFn: async () => {
      const response = await apiClient.get(
        "/club-creation-request/my-requests",
        {
          params: {
            ...(options?.status && { status: options.status }),
          },
        },
      );
      const parsed = getMyClubCreationRequestsResponseSchema.parse(
        response.data,
      );
      return parsed.data;
    },
  });
};

export const useGetClubCreationRequestDetail = (id?: string) => {
  return useQuery<ClubCreationRequestItem, AxiosError<ApiError>>({
    queryKey: ["club-creation-request-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await apiClient.get(
        `/club-creation-request/${id}`
      );

      const parsed =
        clubCreationRequestDetailResponseSchema.parse(response.data);

      return parsed.data;
    },
  });
};

export const useUpdateClubCreationRequestInformation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateClubCreationRequestResponse,
    AxiosError<ApiError>,
    { id: string; data: UpdateClubCreationRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(
        `/club-creation-request/${id}/information`,
        data
      );

      return updateClubCreationRequestResponseSchema.parse(response.data);
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-club-creation-requests"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["club-creation-request-detail", variables.id],
        }),
      ]);
    },
  });
};

export const useUpdateClubCreationRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateClubCreationRequestStatusResponse,
    AxiosError<ApiError>,
    { id: string; data: UpdateClubCreationRequestStatus }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(
        `/club-creation-request/${id}/status`,
        data
      );

      return updateClubCreationRequestStatusResponseSchema.parse(
        response.data
      );
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-club-creation-requests"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["club-creation-request-detail", variables.id],
        }),
      ]);
    },
  });
};




