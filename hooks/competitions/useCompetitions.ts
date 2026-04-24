import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	Competition,
	CompetitionStatus,
	getCompetitionsByClubResponseSchema,
	UpdateCompetitionRequest,
	updateCompetitionRequestSchema,
	competitionSchema,
	CreateCompetitionRequest,
	CompetitionCertificate,
	getCompetitionCertificatesResponseSchema,
	assignCompetitionLevelsRequestSchema,
} from "@/validations/competitions/competitions"
import { getLevelsByDroneResponseSchema, Level } from "@/validations/level/level"

type UseGetCompetitionsByClubOptions = {
	status?: CompetitionStatus | null
}

export const useGetCompetitionsByClub = (
	clubId?: string,
	options?: UseGetCompetitionsByClubOptions
) => {
	return useQuery<Competition[], AxiosError<ApiError>>({
		queryKey: ["club-competitions", clubId, options?.status],
		enabled: !!clubId,
		queryFn: async () => {
			const response = await apiClient.get(`/community/clubs/${clubId}/competitions`, {
				params: {
					...(options?.status !== undefined &&
						options?.status !== null && { status: options.status }),
				},
			})
			const parsed = getCompetitionsByClubResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useCreateCompetition = () => {
	const queryClient = useQueryClient();
	return useMutation<Competition, AxiosError<ApiError>, CreateCompetitionRequest>({
		mutationFn: async (payload) => {
			const response = await apiClient.post("/community/competitions", payload);
			return response.data?.data || response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["club-competitions", variables.clubID] });
		}
	});
}

export const useUpdateCompetition = () => {
	const queryClient = useQueryClient();
	return useMutation<Competition, AxiosError<ApiError>, { id: string; payload: UpdateCompetitionRequest }>({
		mutationFn: async ({ id, payload }) => {
			const response = await apiClient.put(`/community/competitions/${id}`, payload);
			return response.data?.data || response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["club-competitions"] });
			queryClient.invalidateQueries({ queryKey: ["competition", variables.id] });
		}
	});
}

export const useGetCompetitionDetail = (id?: string) => {
	return useQuery<Competition, AxiosError<ApiError>>({
		queryKey: ["competition", id],
		enabled: !!id,
		queryFn: async () => {
			const response = await apiClient.get(`/community/competitions/${id}`);
			const parsed = competitionSchema.parse(response.data?.data || response.data);
			return parsed;
		},
	});
}

export const useDeleteCompetition = () => {
	const queryClient = useQueryClient();
	return useMutation<void, AxiosError<ApiError>, string>({
		mutationFn: async (id) => {
			await apiClient.delete(`/community/competitions/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-competitions"] });
		}
	});
}

export const useGetCompetitionLevels = (competitionId?: string) => {
	return useQuery<Level[], AxiosError<ApiError>>({
		queryKey: ["competition-levels", competitionId],
		enabled: !!competitionId,
		queryFn: async () => {
			const response = await apiClient.get(`/community/competitions/${competitionId}/levels`);
			const parsed = getLevelsByDroneResponseSchema.parse(response.data);
			return parsed.data;
		},
	});
};

export const useAssignCompetitionLevels = () => {
	const queryClient = useQueryClient();
	return useMutation<void, AxiosError<ApiError>, { competitionId: string; levelIds: string[] }>({
		mutationFn: async ({ competitionId, levelIds }) => {
			await apiClient.post(`/community/competitions/${competitionId}/levels`, { levelIds });
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["competition-levels", variables.competitionId] });
		},
	});
};

export const useDeleteCompetitionLevels = () => {
	const queryClient = useQueryClient();
	return useMutation<void, AxiosError<ApiError>, { competitionId: string; levelIds: string[] }>({
		mutationFn: async ({ competitionId, levelIds }) => {
			await apiClient.delete(`/community/competitions/${competitionId}/levels`, {
				data: { levelIds },
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["competition-levels", variables.competitionId] });
		},
	});
};
