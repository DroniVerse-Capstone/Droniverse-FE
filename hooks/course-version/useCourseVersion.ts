import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CourseVersion,
	CreateCourseVersionRequest,
	UpdateCourseVersionRequest,
	AssignCourseVersionCategoriesRequest,
	AssignCourseVersionRequiredDronesRequest,
	GetCourseVersionsData,
	ActivateCourseVersionResponse,
	activateCourseVersionResponseSchema,
	assignCourseVersionCategoriesRequestSchema,
	assignCourseVersionCategoriesResponseSchema,
	assignCourseVersionRequiredDronesRequestSchema,
	assignCourseVersionRequiredDronesResponseSchema,
	createCourseVersionRequestSchema,
	createCourseVersionResponseSchema,
	duplicateCourseVersionResponseSchema,
	getCourseVersionDetailResponseSchema,
	getCourseVersionsResponseSchema,
	updateCourseVersionRequestSchema,
	updateCourseVersionResponseSchema,
	deleteCourseVersionResponseSchema,
	DeleteCourseVersionResponse,
	DuplicateCourseVersionResponse,
	AssignCourseVersionCategoriesResponse,
	AssignCourseVersionRequiredDronesResponse,
} from "@/validations/course-version/course-version"

type CreateCourseVersionVariables = {
	courseId: string
	payload: CreateCourseVersionRequest
}

type UpdateCourseVersionVariables = {
	courseId: string
	versionId: string
	payload: UpdateCourseVersionRequest
}

type ToggleCourseVersionStatusVariables = {
	courseId: string
	versionId: string
}

type DuplicateCourseVersionVariables = {
	courseId: string
	versionId: string
}

type AssignCourseVersionCategoriesVariables = {
	courseId: string
	versionId: string
	payload: AssignCourseVersionCategoriesRequest
}

type AssignCourseVersionRequiredDronesVariables = {
	courseId: string
	versionId: string
	payload: AssignCourseVersionRequiredDronesRequest
}

type UseGetCourseVersionsOptions = {
	courseId?: string
	pageIndex?: number
	pageSize?: number
}

type UseGetCourseVersionDetailOptions = {
	courseId?: string
	versionId?: string
}

export const useGetCourseVersions = (options?: UseGetCourseVersionsOptions) => {
	return useQuery<GetCourseVersionsData, AxiosError<ApiError>>({
		queryKey: [
			"course-versions",
			options?.courseId,
			options?.pageIndex,
			options?.pageSize,
		],
		enabled: Boolean(options?.courseId),
		queryFn: async () => {
			if (!options?.courseId) {
				throw new Error("courseId is required")
			}

			const response = await apiClient.get(
				`/academy/courses/${options.courseId}/versions`,
				{
					params: {
						...(options.pageIndex !== undefined && {
							pageIndex: options.pageIndex,
						}),
						...(options.pageSize !== undefined && { pageSize: options.pageSize }),
					},
				}
			)

			const parsed = getCourseVersionsResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetCourseVersionDetail = (
	options?: UseGetCourseVersionDetailOptions
) => {
	return useQuery<CourseVersion, AxiosError<ApiError>>({
		queryKey: ["course-version-detail", options?.courseId, options?.versionId],
		enabled: Boolean(options?.courseId && options?.versionId),
		queryFn: async () => {
			if (!options?.courseId || !options?.versionId) {
				throw new Error("courseId and versionId are required")
			}

			const response = await apiClient.get(
				`/academy/courses/${options.courseId}/versions/${options.versionId}`
			)

			const parsed = getCourseVersionDetailResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useCreateCourseVersion = () => {
	const queryClient = useQueryClient()

	return useMutation<
		CourseVersion,
		AxiosError<ApiError>,
		CreateCourseVersionVariables
	>({
		mutationFn: async ({ courseId, payload }) => {
			const requestBody = createCourseVersionRequestSchema.parse(payload)
			const response = await apiClient.post(
				`/academy/courses/${courseId}/versions`,
				requestBody
			)

			const parsed = createCourseVersionResponseSchema.parse(response.data)
			return parsed.data
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["courses"] }),
				queryClient.invalidateQueries({ queryKey: ["course-versions"] }),
				queryClient.invalidateQueries({ queryKey: ["course-version-detail"] }),
			])
		},
	})
}

export const useUpdateCourseVersion = () => {
	const queryClient = useQueryClient()

	return useMutation<
		CourseVersion,
		AxiosError<ApiError>,
		UpdateCourseVersionVariables
	>({
		mutationFn: async ({ courseId, versionId, payload }) => {
			const requestBody = updateCourseVersionRequestSchema.parse(payload)
			const response = await apiClient.put(
				`/academy/courses/${courseId}/versions/${versionId}`,
				requestBody
			)

			const parsed = updateCourseVersionResponseSchema.parse(response.data)
			return parsed.data
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["courses"] }),
				queryClient.invalidateQueries({ queryKey: ["course-versions"] }),
				queryClient.invalidateQueries({ queryKey: ["course-version-detail"] }),
			])
		},
	})
}

export const useActivateCourseVersion = () => {
	const queryClient = useQueryClient()

	return useMutation<
		ActivateCourseVersionResponse,
		AxiosError<ApiError>,
		ToggleCourseVersionStatusVariables
	>({
		mutationFn: async ({ courseId, versionId }) => {
			const response = await apiClient.post(
				`/academy/courses/${courseId}/versions/${versionId}/activate`
			)

			return activateCourseVersionResponseSchema.parse(response.data)
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["courses"] }),
				queryClient.invalidateQueries({ queryKey: ["course-versions"] }),
				queryClient.invalidateQueries({ queryKey: ["course-version-detail"] }),
			])
		},
	})
}

export const useDeleteCourseVersion = () => {
	const queryClient = useQueryClient()

	return useMutation<
		DeleteCourseVersionResponse,
		AxiosError<ApiError>,
		ToggleCourseVersionStatusVariables
	>({
		mutationFn: async ({ courseId, versionId }) => {
			const response = await apiClient.delete(
				`/academy/courses/${courseId}/versions/${versionId}`
			)

			return deleteCourseVersionResponseSchema.parse(response.data)
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["courses"] }),
				queryClient.invalidateQueries({ queryKey: ["course-versions"] }),
				queryClient.invalidateQueries({ queryKey: ["course-version-detail"] }),
			])
		},
	})
}

export const useDuplicateCourseVersion = () => {
	const queryClient = useQueryClient()

	return useMutation<
		DuplicateCourseVersionResponse,
		AxiosError<ApiError>,
		DuplicateCourseVersionVariables
	>({
		mutationFn: async ({ courseId, versionId }) => {
			const response = await apiClient.post(
				`/academy/courses/${courseId}/versions/${versionId}/duplicate`
			)

			return duplicateCourseVersionResponseSchema.parse(response.data)
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["courses"] }),
				queryClient.invalidateQueries({ queryKey: ["course-versions"] }),
				queryClient.invalidateQueries({ queryKey: ["course-version-detail"] }),
			])
		},
	})
}

export const useAssignCourseVersionCategories = () => {
	const queryClient = useQueryClient()

	return useMutation<
		AssignCourseVersionCategoriesResponse,
		AxiosError<ApiError>,
		AssignCourseVersionCategoriesVariables
	>({
		mutationFn: async ({ courseId, versionId, payload }) => {
			const requestBody = assignCourseVersionCategoriesRequestSchema.parse(payload)
			const response = await apiClient.post(
				`/academy/courses/${courseId}/versions/${versionId}/categories/bulk`,
				requestBody
			)

			return assignCourseVersionCategoriesResponseSchema.parse(response.data)
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["courses"] }),
				queryClient.invalidateQueries({ queryKey: ["course-versions"] }),
				queryClient.invalidateQueries({ queryKey: ["course-version-detail"] }),
			])
		},
	})
}

export const useAssignCourseVersionRequiredDrones = () => {
	const queryClient = useQueryClient()

	return useMutation<
		AssignCourseVersionRequiredDronesResponse,
		AxiosError<ApiError>,
		AssignCourseVersionRequiredDronesVariables
	>({
		mutationFn: async ({ courseId, versionId, payload }) => {
			const requestBody = assignCourseVersionRequiredDronesRequestSchema.parse(
				payload
			)
			const response = await apiClient.post(
				`/academy/courses/${courseId}/versions/${versionId}/required-drones/bulk`,
				requestBody
			)

			return assignCourseVersionRequiredDronesResponseSchema.parse(response.data)
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["courses"] }),
				queryClient.invalidateQueries({ queryKey: ["course-versions"] }),
				queryClient.invalidateQueries({ queryKey: ["course-version-detail"] }),
			])
		},
	})
}

export type {
	CreateCourseVersionVariables,
	UpdateCourseVersionVariables,
	ToggleCourseVersionStatusVariables,
	DuplicateCourseVersionVariables,
	AssignCourseVersionCategoriesVariables,
	AssignCourseVersionRequiredDronesVariables,
	UseGetCourseVersionsOptions,
	UseGetCourseVersionDetailOptions,
}
