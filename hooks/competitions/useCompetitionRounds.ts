"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import {
    competitionRoundSchema,
    type CompetitionRound,
    type CreateRoundRequest,
    type UpdateRoundRequest,
    getCompetitionRoundsResponseSchema,
    GetRoundLeaderboardResponse,
    getRoundLeaderboardResponseSchema,
    getRoundUserResultsResponseSchema,
    GetRoundUserResultsResponse,
    userRoundResultSchema,
    UserRoundResult
} from "@/validations/competitions/competitions";

// GET rounds for a specific competition
export const useGetCompetitionRounds = (competitionId: string, roundStatus?: string | null) => {
    return useQuery<CompetitionRound[]>({
        queryKey: ["competition-rounds", competitionId, roundStatus],
        queryFn: async () => {
            const response = await apiClient.get(`/community/competitions/${competitionId}/rounds`, {
                params: { roundStatus: roundStatus || undefined }
            });
            const parsed = getCompetitionRoundsResponseSchema.parse(response.data);
            return parsed.data;
        },
        enabled: !!competitionId,
    });
};

// CREATE round
export const useCreateCompetitionRound = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateRoundRequest) => {
            const response = await apiClient.post(`/community/rounds`, payload);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["competition-rounds", variables.competitionID] });
        },
    });
};

// DELETE round
export const useDeleteCompetitionRound = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            competitionId,
            roundId
        }: {
            competitionId: string,
            roundId: string
        }) => {
            const response = await apiClient.delete(`/community/rounds/${roundId}`);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["competition-rounds", variables.competitionId] });
        },
    });
};
// UPDATE round
export const useUpdateCompetitionRound = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ roundId, payload }: { roundId: string, payload: UpdateRoundRequest }) => {
            const response = await apiClient.put(`/community/rounds/${roundId}`, payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["competition-rounds"] });
        },
    });
};

// CANCEL round
export const useCancelCompetitionRound = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (roundId: string) => {
            const response = await apiClient.patch(`/community/rounds/${roundId}/cancel`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["competition-rounds"] });
        },
    });
};

// GET round leaderboard
export const useGetRoundLeaderboard = (
    roundId: string,
    options?: {
        searchName?: string;
        sortDirection?: "Asc" | "Desc";
        currentPage?: number;
        pageSize?: number;
    }
) => {
    return useQuery<GetRoundLeaderboardResponse["data"]>({
        queryKey: ["round-leaderboard", roundId, options?.searchName, options?.sortDirection, options?.currentPage, options?.pageSize],
        enabled: !!roundId,
        queryFn: async () => {
            const response = await apiClient.get(`/community/rounds/${roundId}/leaderboard`, {
                params: {
                    SearchName: options?.searchName?.trim() || undefined,
                    SortDirection: options?.sortDirection || undefined,
                    CurrentPage: options?.currentPage || 1,
                    PageSize: options?.pageSize || 10,
                }
            });
            const parsed = getRoundLeaderboardResponseSchema.parse(response.data);
            return parsed.data;
        }
    });
};
// JOIN round
export const useJoinRound = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (roundId: string) => {
            const response = await apiClient.post(`/community/rounds/${roundId}/join`);
            return response.data;
        },
        onSuccess: (_, roundId) => {
            queryClient.invalidateQueries({ queryKey: ["round-leaderboard", roundId] });
            queryClient.invalidateQueries({ queryKey: ["my-round-results"] });
        },
    });
};

// GET my round results
export const useGetMyRoundResults = (options?: {
    userRoundStatus?: string;
    roundStatus?: string;
    isPassed?: boolean;
    currentPage?: number;
    pageSize?: number;
    refetchInterval?: number | false;
}) => {
    return useQuery<any>({
        queryKey: ["my-round-results", options],
        refetchInterval: options?.refetchInterval ?? false,
        staleTime: 2000,
        queryFn: async () => {
            const response = await apiClient.get(`/community/user-rounds/users/me/rounds`, {
                params: {
                    UserRoundStatus: options?.userRoundStatus || undefined,
                    RoundStatus: options?.roundStatus || undefined,
                    IsPassed: options?.isPassed !== undefined ? options.isPassed : undefined,
                    CurrentPage: options?.currentPage || 1,
                    PageSize: options?.pageSize || 20,
                }
            });
            return response.data;
        }
    });
};

export const useGetMyRoundResultDetail = (roundId: string) => {
    return useQuery<any>({
        queryKey: ["my-round-result-detail", roundId],
        staleTime: 10000,
        queryFn: async () => {
            const response = await apiClient.get(`/community/user-rounds/users/me/rounds/${roundId}`);
            return response.data;
        },
        enabled: !!roundId,
    });
};

// --- New Manager Monitoring Hooks ---

// API #4: Get all participants' results for a round
export const useGetRoundUserResults = (
    roundId: string,
    options?: {
        status?: string;
        search?: string;
        currentPage?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
        refetchInterval?: number | false | ((data: GetRoundUserResultsResponse["data"] | undefined) => number | false);
    }
) => {
    return useQuery<GetRoundUserResultsResponse["data"]>({
        queryKey: ["round-user-results", roundId, options?.status, options?.search, options?.currentPage, options?.pageSize, options?.sortBy, options?.sortDirection],
        enabled: !!roundId,
        refetchInterval: options?.refetchInterval !== undefined ? (options.refetchInterval as any) : 5000,
        queryFn: async () => {
            const response = await apiClient.get(`/community/user-rounds/users/rounds/${roundId}`, {
                params: {
                    Status: options?.status || undefined,
                    SearchName: options?.search?.trim() || undefined,
                    CurrentPage: options?.currentPage || 1,
                    PageSize: options?.pageSize || 10,
                    SortBy: options?.sortBy || undefined,
                    SortDirection: options?.sortDirection || undefined,
                }
            });
            const parsed = getRoundUserResultsResponseSchema.parse(response.data);
            return parsed.data;
        }
    });
};

// API #1: Get a specific user's result for a round
export const useGetUserRoundResultDetail = (userId: string, roundId: string) => {
    return useQuery<UserRoundResult>({
        queryKey: ["user-round-result-detail", userId, roundId],
        enabled: !!userId && !!roundId,
        queryFn: async () => {
            const response = await apiClient.get(`/community/user-rounds/users/${userId}/rounds/${roundId}`);
            const parsed = userRoundResultSchema.parse(response.data.data);
            return parsed;
        },
    });
};
