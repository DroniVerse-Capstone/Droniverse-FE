
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
    CompetitionCertificate,
    getCompetitionCertificatesResponseSchema,
    AssignCompetitionCertificatesRequest,
    assignCompetitionCertificatesRequestSchema,
} from "@/validations/competitions/competitions"

export const useGetCompetitionCertificates = (competitionId?: string) => {
    return useQuery<CompetitionCertificate[], AxiosError<ApiError>>({
        queryKey: ["competition-certificates", competitionId],
        enabled: !!competitionId,
        queryFn: async () => {
            const response = await apiClient.get(`/community/competitions/${competitionId}/certificates`);
            // Handle both { data: [...] } and { data: { data: [...] } }
            const rawData = response.data?.data;
            const dataToParse = Array.isArray(rawData) ? rawData : rawData?.data || response.data;

            const parsed = getCompetitionCertificatesResponseSchema.parse({
                ...response.data,
                data: Array.isArray(dataToParse) ? dataToParse : []
            });
            return parsed.data;
        },
    });
}

export const useAssignCompetitionCertificates = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>, { competitionId: string; payload: AssignCompetitionCertificatesRequest }>({
        mutationFn: async ({ competitionId, payload }) => {
            const requestBody = assignCompetitionCertificatesRequestSchema.parse(payload);
            await apiClient.post(`/community/competitions/${competitionId}/certificates`, requestBody);
        },
        onSuccess: (_, { competitionId }) => {
            queryClient.invalidateQueries({ queryKey: ["competition-certificates", competitionId] });
        },
    });
}

// Fetch all available certificates
export const useGetAllCertificates = () => {
    return useQuery<CompetitionCertificate[], AxiosError<ApiError>>({
        queryKey: ["all-certificates"],
        queryFn: async () => {
            const response = await apiClient.get("/academy/certificates", {
                params: {
                    pageSize: 100,
                }
            });
            // Handle nested data: response.data.data.data
            const rawData = response.data?.data;
            const finalData = Array.isArray(rawData) ? rawData : rawData?.data || [];
            return finalData;
        },
    });
}

export const useDeleteCompetitionCertificates = () => {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError<ApiError>, { competitionId: string; payload: AssignCompetitionCertificatesRequest }>({
        mutationFn: async ({ competitionId, payload }) => {
            const requestBody = assignCompetitionCertificatesRequestSchema.parse(payload);
            await apiClient.delete(`/community/competitions/${competitionId}/certificates`, {
                data: requestBody
            });
        },
        onSuccess: (_, { competitionId }) => {
            queryClient.invalidateQueries({ queryKey: ["competition-certificates", competitionId] });
        },
    });
}
