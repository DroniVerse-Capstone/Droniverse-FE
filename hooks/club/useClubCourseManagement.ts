import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	GetClubCourseManagementData,
	GetClubCourseManagementQuery,
	getClubCourseManagementQuerySchema,
	getClubCourseManagementResponseSchema,
} from "@/validations/club/club-course-management"

type UseGetClubCourseManagementOptions = Omit<
	GetClubCourseManagementQuery,
	"currentPage" | "pageSize"
> & {
	currentPage?: number
	pageSize?: number
}

export const useGetClubCourseManagement = (
	clubId?: string,
	options?: UseGetClubCourseManagementOptions
) => {
	return useQuery<GetClubCourseManagementData, AxiosError<ApiError>>({
		queryKey: [
			"club-course-management",
			clubId,
			options?.level,
			options?.profitType,
			options?.courseSortBy,
			options?.courseSortDirection,
			options?.currentPage,
			options?.pageSize,
		],
		enabled: !!clubId,
		queryFn: async () => {
			if (!clubId) {
				throw new Error("clubId is required")
			}

			const parsedOptions = getClubCourseManagementQuerySchema.parse(
				options ?? {}
			)

			const response = await apiClient.get(
				`/community/clubs/${clubId}/courses/management`,
				{
					params: {
						...(parsedOptions.level && { Level: parsedOptions.level }),
						...(parsedOptions.profitType && {
							ProfitType: parsedOptions.profitType,
						}),
						...(parsedOptions.courseSortBy && {
							CourseSortBy: parsedOptions.courseSortBy,
						}),
						...(parsedOptions.courseSortDirection && {
							CourseSortDirection: parsedOptions.courseSortDirection,
						}),
						CurrentPage: parsedOptions.currentPage,
						PageSize: parsedOptions.pageSize,
					},
				}
			)

			const parsed = getClubCourseManagementResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export type { UseGetClubCourseManagementOptions }
