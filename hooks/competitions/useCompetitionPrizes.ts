"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    competitionPrizeSchema,
    type CompetitionPrize,
    type CreateCompetitionPrizeRequest
} from "@/validations/competitions/competitions";
import apiClient from "@/lib/api/client"

import { z } from "zod";

const prizesResponseSchema = z.object({
    isSuccess: z.boolean(),
    message: z.string(),
    data: z.array(competitionPrizeSchema)
});

// GET prizes for a specific competition
export const useGetCompetitionPrizes = (competitionId: string) => {
    return useQuery<CompetitionPrize[]>({
        queryKey: ["competition-prizes", competitionId],
        queryFn: async () => {
            const response = await apiClient.get(`/community/competitions/${competitionId}/prizes`);
            const parsed = prizesResponseSchema.parse(response.data);
            return parsed.data;
        },
        enabled: !!competitionId,
    });
};

// CREATE prize
export const useCreateCompetitionPrize = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            competitionId,
            payload
        }: {
            competitionId: string,
            payload: CreateCompetitionPrizeRequest
        }) => {
            const response = await apiClient.post(`/community/competitions/${competitionId}/prizes`, payload);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["competition-prizes", variables.competitionId] });
        },
    });
};

// UPDATE prize - NEW PATH: /community/competition-prizes/{prizeId}
export const useUpdateCompetitionPrize = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            competitionId,
            prizeId,
            payload
        }: {
            competitionId: string,
            prizeId: string,
            payload: CreateCompetitionPrizeRequest
        }) => {
            const response = await apiClient.put(`/community/competition-prizes/${prizeId}`, payload);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["competition-prizes", variables.competitionId] });
        },
    });
};

// DELETE prize - NEW PATH: /community/competition-prizes/{prizeId}
export const useDeleteCompetitionPrize = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            competitionId,
            prizeId
        }: {
            competitionId: string,
            prizeId: string
        }) => {
            const response = await apiClient.delete(`/community/competition-prizes/${prizeId}`);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["competition-prizes", variables.competitionId] });
        },
    });
};
// GET my prizes across all competitions
const myPrizeItemSchema = z.object({
    competition: z.object({
        competitionID: z.string(),
        nameVN: z.string(),
        nameEN: z.string(),
    }),
    prize: z.object({
        prizeId: z.string(),
        titleVN: z.string(),
        titleEN: z.string(),
        rank: z.number(),
        rewardType: z.enum(["MONEY", "GIFT"]),
        rewardValueMoney: z.number().nullable().optional(),
        rewardValueGiftVN: z.string().nullable().optional(),
        rewardValueGiftEN: z.string().nullable().optional(),
        awardedAt: z.string(),
    })
});

const myPrizesResponseSchema = z.object({
    isSuccess: z.boolean(),
    message: z.string(),
    data: z.object({
        data: z.array(myPrizeItemSchema),
        totalRecords: z.number(),
        pageIndex: z.number(),
        pageSize: z.number(),
        totalPages: z.number(),
    })
});

export type MyPrizeItem = z.infer<typeof myPrizeItemSchema>;

export const useGetMyPrizes = (options?: {
    currentPage?: number;
    pageSize?: number;
    competitionName?: string;
}) => {
    return useQuery({
        queryKey: ["my-prizes", options],
        queryFn: async () => {
            const response = await apiClient.get(`/community/competitions/my-prizes`, {
                params: {
                    CurrentPage: options?.currentPage || 1,
                    PageSize: options?.pageSize || 10,
                    CompetitionName: options?.competitionName || undefined,
                }
            });
            const parsed = myPrizesResponseSchema.parse(response.data);
            return parsed.data;
        }
    });
};
