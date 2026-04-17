"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import {
    competitionRoundSchema,
    type CompetitionRound,
    type CreateRoundRequest,
    getCompetitionRoundsResponseSchema
} from "@/validations/competitions/competitions";

// GET rounds for a specific competition
export const useGetCompetitionRounds = (competitionId: string) => {
    return useQuery<CompetitionRound[]>({
        queryKey: ["competition-rounds", competitionId],
        queryFn: async () => {
            const response = await apiClient.get(`/community/competitions/${competitionId}/rounds`);
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
