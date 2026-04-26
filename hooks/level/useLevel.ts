import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	Level,
	getLevelsByDroneResponseSchema,
	addLevelCourseRequestSchema,
	addLevelCourseResponseSchema,
	AddLevelCourseRequest,
	AddLevelCourseResponse,
	LevelPath,
	getLevelPathResponseSchema,
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

interface UseAddLevelCourseOptions {
	onSuccess?: (data: AddLevelCourseResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

export const useAddLevelCourse = (options?: UseAddLevelCourseOptions) => {
	const queryClient = useQueryClient()

	return useMutation<
		AddLevelCourseResponse,
		AxiosError<ApiError>,
		{ levelId: string; data: AddLevelCourseRequest }
	>({
		mutationFn: async ({ levelId, data }) => {
			const response = await apiClient.post(
				`/academy/level/AddLevelCourse/${levelId}`,
				data
			)
			return addLevelCourseResponseSchema.parse(response.data)
		},
		onSuccess: (data, variables) => {
			// Invalidate levels-by-drone query so that the UI can refresh if needed
			queryClient.invalidateQueries({ queryKey: ["levels-by-drone"] })
			queryClient.invalidateQueries({ queryKey: ["level-path"] })
			options?.onSuccess?.(data)
		},
		onError: (error) => {
			if (process.env.NODE_ENV === "development") {
				console.error("Add level course error:", error)
			}
			options?.onError?.(error)
		},
	})
}

export const useGetLevelPath = (droneId?: string) => {
	return useQuery<LevelPath[], AxiosError<ApiError>>({
		queryKey: ["level-path", droneId],
		enabled: Boolean(droneId),
		queryFn: async () => {
			if (!droneId) {
				throw new Error("droneId is required")
			}

			const response = await apiClient.get(
				`/academy/level/GetLevelPath/${droneId}`
			)
			const parsed = getLevelPathResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}
