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
	ParticipantStatus,
	GetCompetitionParticipantsResponse,
	getCompetitionParticipantsResponseSchema,
	GetCompetitionLeaderboardResponse,
	getCompetitionLeaderboardResponseSchema,
	CompetitionParticipation,
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

export const useGetCompetitionParticipants = (
	competitionId: string,
	options?: {
		status?: ParticipantStatus | null;
		currentPage?: number;
		pageSize?: number;
	}
) => {
	return useQuery<GetCompetitionParticipantsResponse["data"], AxiosError<ApiError>>({
		queryKey: ["competition-participants", competitionId, options?.status, options?.currentPage, options?.pageSize],
		enabled: !!competitionId,
		queryFn: async () => {
			const response = await apiClient.get(`/community/competitions/${competitionId}/participants`, {
				params: {
					Status: options?.status || undefined,
					CurrentPage: options?.currentPage || 1,
					PageSize: options?.pageSize || 10,
				},
			});
			const parsed = getCompetitionParticipantsResponseSchema.parse(response.data);
			return parsed.data;
		},
	});
};

export const useGetCompetitionLeaderboard = (
	competitionId: string,
	options?: {
		currentPage?: number;
		pageSize?: number;
	}
) => {
	return useQuery<GetCompetitionLeaderboardResponse["data"], AxiosError<ApiError>>({
		queryKey: ["competition-leaderboard", competitionId, options?.currentPage, options?.pageSize],
		enabled: !!competitionId,
		queryFn: async () => {
			const response = await apiClient.get(`/community/competitions/${competitionId}/leaderboard`, {
				params: {
					CurrentPage: options?.currentPage || 1,
					PageSize: options?.pageSize || 10,
				},
			});
			const parsed = getCompetitionLeaderboardResponseSchema.parse(response.data);
			return parsed.data;
		},
	});
};

export const useRegisterCompetition = () => {
	const queryClient = useQueryClient();
	return useMutation<void, AxiosError<ApiError>, string>({
		mutationFn: async (id) => {
			await apiClient.post(`/community/competitions/${id}/register`);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ["competition", id] });
			queryClient.invalidateQueries({ queryKey: ["club-competitions"] });
		}
	});
}

export const useWithdrawCompetition = () => {
	const queryClient = useQueryClient();
	return useMutation<void, AxiosError<ApiError>, string>({
		mutationFn: async (id) => {
			await apiClient.post(`/community/competitions/${id}/withdraw`);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ["competition", id] });
			queryClient.invalidateQueries({ queryKey: ["club-competitions"] });
		}
	});
}

export const useGetMyCompetitionParticipation = (id: string) => {
	return useQuery<CompetitionParticipation | null, AxiosError<ApiError>>({
		queryKey: ["my-competition-participation", id],
		enabled: !!id,
		queryFn: async () => {
			try {
				const response = await apiClient.get(`/community/competitions/${id}/my-participation`);
				return response.data?.data || response.data;
			} catch (error: any) {
				if (error.response?.status === 404) return null;
				throw error;
			}
		},
	});
}

export const useUpdateCompetitionStatus = () => {
	const queryClient = useQueryClient();
	return useMutation<void, AxiosError<ApiError>, { id: string; status: CompetitionStatus; invalidReason?: string | null }>({
		mutationFn: async ({ id, status, invalidReason }) => {
			await apiClient.patch(`/community/competitions/${id}/status`, {
				status,
				invalidReason: invalidReason || null,
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["club-competitions"] });
			queryClient.invalidateQueries({ queryKey: ["competition", variables.id] });
		}
	});
}

export const useDisqualifyParticipant = () => {
	const queryClient = useQueryClient();
	return useMutation<void, AxiosError<ApiError>, { competitionId: string; userId: string }>({
		mutationFn: async ({ competitionId, userId }) => {
			await apiClient.post(`/community/competitions/${competitionId}/participants/${userId}/disqualified`);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["competition-participants", variables.competitionId] });
		},
	});
};

// POST /community/competitions/{competitionId}/aggregate
// Tính điểm xếp hạng và trao giải thưởng cho người chơi
export const useAggregateCompetition = () => {
	const queryClient = useQueryClient();
	return useMutation<void, AxiosError<ApiError>, string>({
		mutationFn: async (competitionId: string) => {
			await apiClient.post(`/community/competitions/${competitionId}/aggregate`);
		},
		onSuccess: (_, competitionId) => {
			queryClient.invalidateQueries({ queryKey: ["competition", competitionId] });
			queryClient.invalidateQueries({ queryKey: ["club-competitions"] });
			queryClient.invalidateQueries({ queryKey: ["competition-prizes", competitionId] });
			queryClient.invalidateQueries({ queryKey: ["competition-leaderboard", competitionId] });
			queryClient.invalidateQueries({ queryKey: ["competition-participants", competitionId] });
		},
	});
};
