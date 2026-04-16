import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CreateModuleRequest,
	DeleteModuleResponse,
	Module,
	UpdateModuleResponse,
	UpdateModuleRequest,
	createModuleRequestSchema,
	createModuleResponseSchema,
	deleteModuleResponseSchema,
	getModuleDetailResponseSchema,
	getModulesResponseSchema,
	updateModuleRequestSchema,
	updateModuleResponseSchema,
} from "@/validations/module/module"

type UseGetModulesOptions = {
	courseId?: string
	versionId?: string
}

type UseGetModuleDetailOptions = {
	courseId?: string
	versionId?: string
	moduleId?: string
}

type CreateModuleVariables = {
	courseId: string
	versionId: string
	payload: CreateModuleRequest
}

type UpdateModuleVariables = {
	courseId: string
	versionId: string
	moduleId: string
	payload: UpdateModuleRequest
}

type DeleteModuleVariables = {
	courseId: string
	versionId: string
	moduleId: string
}

export const useGetModules = (options?: UseGetModulesOptions) => {
	return useQuery<Module[], AxiosError<ApiError>>({
		queryKey: ["modules", options?.courseId, options?.versionId],
		enabled: Boolean(options?.courseId && options?.versionId),
		queryFn: async () => {
			if (!options?.courseId || !options?.versionId) {
				throw new Error("courseId and versionId are required")
			}

			const response = await apiClient.get(
				`/academy/courses/${options.courseId}/versions/${options.versionId}/modules`
			)

			const parsed = getModulesResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useCreateModule = () => {
	const queryClient = useQueryClient()

	return useMutation<Module, AxiosError<ApiError>, CreateModuleVariables>({
		mutationFn: async ({ courseId, versionId, payload }) => {
			const requestBody = createModuleRequestSchema.parse(payload)
			const response = await apiClient.post(
				`/academy/courses/${courseId}/versions/${versionId}/modules`,
				requestBody
			)

			const parsed = createModuleResponseSchema.parse(response.data)
			return parsed.data
		},
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["modules", variables.courseId, variables.versionId],
			})
		},
	})
}

export const useGetModuleDetail = (options?: UseGetModuleDetailOptions) => {
	return useQuery<Module, AxiosError<ApiError>>({
		queryKey: [
			"module-detail",
			options?.courseId,
			options?.versionId,
			options?.moduleId,
		],
		enabled: Boolean(
			options?.courseId && options?.versionId && options?.moduleId
		),
		queryFn: async () => {
			if (!options?.courseId || !options?.versionId || !options?.moduleId) {
				throw new Error("courseId, versionId and moduleId are required")
			}

			const response = await apiClient.get(
				`/academy/courses/${options.courseId}/versions/${options.versionId}/modules/${options.moduleId}`
			)

			const parsed = getModuleDetailResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useUpdateModule = () => {
	const queryClient = useQueryClient()

	return useMutation<UpdateModuleResponse, AxiosError<ApiError>, UpdateModuleVariables>({
		mutationFn: async ({ courseId, versionId, moduleId, payload }) => {
			const requestBody = updateModuleRequestSchema.parse(payload)
			const response = await apiClient.put(
				`/academy/courses/${courseId}/versions/${versionId}/modules/${moduleId}`,
				requestBody
			)

			const parsed = updateModuleResponseSchema.parse(response.data)
			return parsed
		},
		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["modules", variables.courseId, variables.versionId],
				}),
				queryClient.invalidateQueries({
					queryKey: [
						"module-detail",
						variables.courseId,
						variables.versionId,
						variables.moduleId,
					],
				}),
			])
		},
	})
}

export const useDeleteModule = () => {
	const queryClient = useQueryClient()

	return useMutation<
		DeleteModuleResponse,
		AxiosError<ApiError>,
		DeleteModuleVariables
	>({
		mutationFn: async ({ courseId, versionId, moduleId }) => {
			const response = await apiClient.delete(
				`/academy/courses/${courseId}/versions/${versionId}/modules/${moduleId}`
			)

			return deleteModuleResponseSchema.parse(response.data)
		},
		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["modules", variables.courseId, variables.versionId],
				}),
				queryClient.invalidateQueries({
					queryKey: [
						"module-detail",
						variables.courseId,
						variables.versionId,
						variables.moduleId,
					],
				}),
			])
		},
	})
}

export type {
	CreateModuleVariables,
	DeleteModuleVariables,
	UpdateModuleVariables,
	UseGetModuleDetailOptions,
	UseGetModulesOptions,
}
