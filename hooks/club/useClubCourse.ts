import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	GetClubCoursesData,
	getClubCoursesQuerySchema,
	getClubCoursesResponseSchema,
	GetClubCoursesQuery,
} from "@/validations/club/club-course"

type UseGetClubCoursesOptions = Omit<
	GetClubCoursesQuery,
	"currentPage" | "pageSize"
> & {
	currentPage?: number
	pageSize?: number
}

export const useGetClubCourses = (
	clubId?: string,
	options?: UseGetClubCoursesOptions
) => {
	return useQuery<GetClubCoursesData, AxiosError<ApiError>>({
		queryKey: [
			"club-courses",
			clubId,
			options?.level,
			options?.participationSort,
			options?.courseOwner,
			options?.courseName,
			options?.currentPage,
			options?.pageSize,
		],
		enabled: !!clubId,
		queryFn: async () => {
			if (!clubId) {
				throw new Error("clubId is required")
			}

			const parsedOptions = getClubCoursesQuerySchema.parse(options ?? {})

			const response = await apiClient.get(`/community/clubs/${clubId}/courses`, {
				params: {
					...(parsedOptions.level && { Level: parsedOptions.level }),
					...(parsedOptions.participationSort && {
						ParticipationSort: parsedOptions.participationSort,
					}),
					...(parsedOptions.courseOwner && {
						CourseOwner: parsedOptions.courseOwner,
					}),
					...(parsedOptions.courseName && { CourseName: parsedOptions.courseName }),
					CurrentPage: parsedOptions.currentPage,
					PageSize: parsedOptions.pageSize,
				},
			})

			const parsed = getClubCoursesResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export type { UseGetClubCoursesOptions }
