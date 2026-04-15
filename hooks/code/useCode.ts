import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CourseCodeUsersPaging,
	GenerateCodesRequest,
	GenerateCodesResponse,
	GetCourseCodesByClubData,
	GetCourseCodesByClubQuery,
	generateCodesRequestSchema,
	generateCodesResponseSchema,
	getCourseCodesByClubParamsSchema,
	getCourseCodesByClubQuerySchema,
	getCourseCodesByClubResponseSchema,
	GetCourseUsersCodesByClubQuery,
	getCourseUsersCodesByClubParamsSchema,
	getCourseUsersCodesByClubQuerySchema,
	getCourseUsersCodesByClubResponseSchema,
} from "@/validations/code/code"

type UseGetCourseCodesByClubOptions = Omit<
	GetCourseCodesByClubQuery,
	"currentPage" | "pageSize"
> & {
	currentPage?: number
	pageSize?: number
}

type UseGetCourseUsersCodesByClubOptions = Omit<
	GetCourseUsersCodesByClubQuery,
	"currentPage" | "pageSize"
> & {
	currentPage?: number
	pageSize?: number
}

export const useGetCourseCodesByClub = (
	clubId?: string,
	courseId?: string,
	options?: UseGetCourseCodesByClubOptions
) => {
	return useQuery<GetCourseCodesByClubData, AxiosError<ApiError>>({
		queryKey: [
			"course-codes-by-club",
			clubId,
			courseId,
			options?.codeUseState,
			options?.codeOwnState,
			options?.currentPage,
			options?.pageSize,
		],
		enabled: !!clubId && !!courseId,
		queryFn: async () => {
			const parsedParams = getCourseCodesByClubParamsSchema.parse({
				clubId,
				courseId,
			})
			const parsedOptions = getCourseCodesByClubQuerySchema.parse(options ?? {})

			const response = await apiClient.get(
				`/academy/codes/${parsedParams.clubId}/courses/${parsedParams.courseId}/codes`,
				{
					params: {
						...(parsedOptions.codeUseState && {
							CodeUseState: parsedOptions.codeUseState,
						}),
						...(parsedOptions.codeOwnState && {
							CodeOwnState: parsedOptions.codeOwnState,
						}),
						CurrentPage: parsedOptions.currentPage,
						PageSize: parsedOptions.pageSize,
					},
				}
			)

			const parsed = getCourseCodesByClubResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetCourseUsersCodesByClub = (
	clubId?: string,
	courseId?: string,
	options?: UseGetCourseUsersCodesByClubOptions
) => {
	return useQuery<CourseCodeUsersPaging, AxiosError<ApiError>>({
		queryKey: [
			"course-users-codes-by-club",
			clubId,
			courseId,
			options?.fullName,
			options?.email,
			options?.userCodes,
			options?.currentPage,
			options?.pageSize,
		],
		enabled: !!clubId && !!courseId,
		queryFn: async () => {
			const parsedParams = getCourseUsersCodesByClubParamsSchema.parse({
				clubId,
				courseId,
			})
			const parsedOptions = getCourseUsersCodesByClubQuerySchema.parse(
				options ?? {}
			)

			const response = await apiClient.get(
				`/academy/codes/clubs/${parsedParams.clubId}/course/${parsedParams.courseId}/users-codes`,
				{
					params: {
						...(parsedOptions.fullName && { FullName: parsedOptions.fullName }),
						...(parsedOptions.email && { Email: parsedOptions.email }),
						...(parsedOptions.userCodes && { UserCodes: parsedOptions.userCodes }),
						CurrentPage: parsedOptions.currentPage,
						PageSize: parsedOptions.pageSize,
					},
				}
			)

			const parsed = getCourseUsersCodesByClubResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGenerateCodes = () => {
	const queryClient = useQueryClient()

	return useMutation<
		GenerateCodesResponse,
		AxiosError<ApiError>,
		GenerateCodesRequest
	>({
		mutationFn: async (payload) => {
			const parsedPayload = generateCodesRequestSchema.parse(payload)

			const response = await apiClient.post("/academy/codes/generate", parsedPayload)
			return generateCodesResponseSchema.parse(response.data)
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["course-codes-by-club", variables.clubId, variables.courseId],
			})
			queryClient.invalidateQueries({
				queryKey: [
					"course-users-codes-by-club",
					variables.clubId,
					variables.courseId,
				],
			})
		},
	})
}

export type { UseGetCourseCodesByClubOptions }
export type { UseGetCourseUsersCodesByClubOptions }
