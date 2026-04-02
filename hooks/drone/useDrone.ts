import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	Drone,
	DroneStatusFilter,
	getDronesResponseSchema,
} from "@/validations/drone/drone"

type UseGetDronesOptions = {
	status?: DroneStatusFilter
}

export const useGetDrones = (options?: UseGetDronesOptions) => {
	return useQuery<Drone[], AxiosError<ApiError>>({
		queryKey: ["drones", options?.status ?? "All"],
		queryFn: async () => {
			const response = await apiClient.get("/academy/drones", {
				params:
					options?.status && options.status !== "All"
						? { status: options.status }
						: undefined,
			})

			const parsed = getDronesResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export type { UseGetDronesOptions }
