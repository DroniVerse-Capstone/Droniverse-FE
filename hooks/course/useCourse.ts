import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	Course,
	DeleteCourseResponse,
	GetCoursesData,
	PublishCourseResponse,
	UnpublishCourseResponse,
	createCourseResponseSchema,
	deleteCourseResponseSchema,
	getCourseDetailResponseSchema,
	getCoursesResponseSchema,
	publishCourseResponseSchema,
	unpublishCourseResponseSchema,
} from "@/validations/course/course"

type CourseStatus = "DRAFT" | "PUBLISH" | "UNPUBLISH" | "ARCHIVED" 

type UseGetCoursesOptions = {
	pageIndex?: number
	pageSize?: number
	search?: string
	status?: CourseStatus | null
}

type CourseActionVariables = {
	courseId: string
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

export const useGetCourseDetail = (courseId?: string) => {
	return useQuery<Course, AxiosError<ApiError>>({
		queryKey: ["course-detail", courseId],
		enabled: Boolean(courseId),
		queryFn: async () => {
			if (!courseId) {
				throw new Error("courseId is required")
			}

			const response = await apiClient.get(`/academy/courses/${courseId}`)
			const parsed = getCourseDetailResponseSchema.parse(response.data)

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

export const usePublishCourse = () => {
	const queryClient = useQueryClient()

	return useMutation<
		PublishCourseResponse,
		AxiosError<ApiError>,
		CourseActionVariables
	>({
		mutationFn: async ({ courseId }) => {
			const response = await apiClient.post(`/academy/courses/${courseId}/publish`)
			return publishCourseResponseSchema.parse(response.data)
		},
		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["courses"] }),
				queryClient.invalidateQueries({
					queryKey: ["course-detail", variables.courseId],
				}),
			])
		},
	})
}

export const useUnpublishCourse = () => {
	const queryClient = useQueryClient()

	return useMutation<
		UnpublishCourseResponse,
		AxiosError<ApiError>,
		CourseActionVariables
	>({
		mutationFn: async ({ courseId }) => {
			const response = await apiClient.post(
				`/academy/courses/${courseId}/unpublish`
			)
			return unpublishCourseResponseSchema.parse(response.data)
		},
		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["courses"] }),
				queryClient.invalidateQueries({
					queryKey: ["course-detail", variables.courseId],
				}),
			])
		},
	})
}

export const useDeleteCourse = () => {
	const queryClient = useQueryClient()

	return useMutation<
		DeleteCourseResponse,
		AxiosError<ApiError>,
		CourseActionVariables
	>({
		mutationFn: async ({ courseId }) => {
			const response = await apiClient.delete(`/academy/courses/${courseId}`)
			return deleteCourseResponseSchema.parse(response.data)
		},
		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["courses"] }),
				queryClient.invalidateQueries({
					queryKey: ["course-detail", variables.courseId],
				}),
			])
		},
	})
}

export type { CourseActionVariables, CourseStatus, UseGetCoursesOptions }
