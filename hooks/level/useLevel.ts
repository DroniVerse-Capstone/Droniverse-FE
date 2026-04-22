import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	Level,
	getLevelsByDroneResponseSchema,
} from "@/validations/level/level"

export const useGetLevelsByDrone = (droneId?: string) => {
	return useQuery<Level[], AxiosError<ApiError>>({
		queryKey: ["levels-by-drone", droneId],
		enabled: Boolean(droneId),
		queryFn: async () => {
			if (!droneId) {
				throw new Error("droneId is required")
			}

			const response = await apiClient.get(
				`/academy/level/GetLevelByDrone/${droneId}`
			)
			const parsed = getLevelsByDroneResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}
