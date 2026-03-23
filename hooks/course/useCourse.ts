import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	Course,
	GetCoursesData,
	createCourseResponseSchema,
	getCoursesResponseSchema,
} from "@/validations/course/course"

type CourseStatus = "DRAFT" | "PUBLISH" | "UNPUBLISH" | "ARCHIVED" 

type UseGetCoursesOptions = {
	pageIndex?: number
	pageSize?: number
	search?: string
	status?: CourseStatus | null
}

export const useGetCourses = (options?: UseGetCoursesOptions) => {
	return useQuery<GetCoursesData, AxiosError<ApiError>>({
		queryKey: [
			"courses",
			options?.pageIndex,
			options?.pageSize,
			options?.search,
			options?.status,
		],
		queryFn: async () => {
			const response = await apiClient.get("/academy/courses", {
				params: {
					...(options?.pageIndex !== undefined && { pageIndex: options.pageIndex }),
					...(options?.pageSize !== undefined && { pageSize: options.pageSize }),
					...(options?.search && { search: options.search }),
					...(options?.status && { status: options.status }),
				},
			})

			const parsed = getCoursesResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useCreateCourse = () => {
	const queryClient = useQueryClient()

	return useMutation<Course, AxiosError<ApiError>, void>({
		mutationFn: async () => {
			const response = await apiClient.post("/academy/courses")
			const parsed = createCourseResponseSchema.parse(response.data)
			return parsed.data
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["courses"] })
		},
	})
}

export type { CourseStatus, UseGetCoursesOptions }
