"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import {
    competitionRoundSchema,
    type CompetitionRound,
    type CreateRoundRequest,
    type UpdateRoundRequest,
    getCompetitionRoundsResponseSchema
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
