import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	GetClubCoursesData,
	ClubCourseOverview,
	GetClubHotCoursesData,
	getClubCourseOverviewQuerySchema,
	getClubCourseOverviewResponseSchema,
	getClubCoursesQuerySchema,
	getClubCoursesResponseSchema,
	getClubHotCoursesQuerySchema,
	getClubHotCoursesResponseSchema,
	GetClubCoursesQuery,
	GetClubHotCoursesQuery,
} from "@/validations/club/club-course"

type UseGetClubCoursesOptions = Omit<
	GetClubCoursesQuery,
	"currentPage" | "pageSize"
> & {
	currentPage?: number
	pageSize?: number
}

type UseGetClubHotCoursesOptions = Omit<
	GetClubHotCoursesQuery,
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

			const response = await apiClient.get(`/academy/courses/club/${clubId}`, {
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

export const useGetClubHotCourses = (
	clubId?: string,
	options?: UseGetClubHotCoursesOptions
) => {
	return useQuery<GetClubHotCoursesData, AxiosError<ApiError>>({
		queryKey: ["club-hot-courses", clubId, options?.currentPage, options?.pageSize],
		enabled: !!clubId,
		queryFn: async () => {
			if (!clubId) {
				throw new Error("clubId is required")
			}

			const parsedOptions = getClubHotCoursesQuerySchema.parse(options ?? {})

			const response = await apiClient.get(
				`/community/clubs/${clubId}/courses/hot`,
				{
					params: {
						CurrentPage: parsedOptions.currentPage,
						PageSize: parsedOptions.pageSize,
					},
				}
			)

			const parsed = getClubHotCoursesResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetClubCourseOverview = (
	clubId?: string,
	courseId?: string
) => {
	return useQuery<ClubCourseOverview, AxiosError<ApiError>>({
		queryKey: ["club-course-overview", clubId, courseId],
		enabled: !!clubId && !!courseId,
		queryFn: async () => {
			const parsedQuery = getClubCourseOverviewQuerySchema.parse({
				clubId,
				courseId,
			})

			const response = await apiClient.get(
				`/academy/courses/${parsedQuery.courseId}/overview`,
				{
					params: {
						clubId: parsedQuery.clubId,
					},
				}
			)

			const parsed = getClubCourseOverviewResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export type { UseGetClubCoursesOptions }
export type { UseGetClubHotCoursesOptions }
