import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	Competition,
	CompetitionStatus,
	getCompetitionsByClubResponseSchema,
} from "@/validations/competitions/competitions"

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
