import { z } from "zod"

export const moduleSchema = z.object({
	moduleID: z.string(),
	titleVN: z.string(),
	titleEN: z.string(),
	moduleNumber: z.number().int().positive(),
	createAt: z.string(),
	updateAt: z.string(),
})

export const createModuleRequestSchema = z.object({
	titleVN: z.string(),
	titleEN: z.string(),
	moduleNumber: z.number().int().positive(),
})

export const updateModuleRequestSchema = z.object({
	titleVN: z.string(),
	titleEN: z.string(),
	moduleNumber: z.number().int().positive(),
})

export const getModulesResponseSchema = z.object({
	data: z.array(moduleSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const createModuleResponseSchema = z.object({
	data: moduleSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getModuleDetailResponseSchema = z.object({
	data: moduleSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const updateModuleResponseSchema = z.object({
	data: moduleSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const deleteModuleResponseSchema = z.object({
	isSuccess: z.boolean(),
	message: z.string(),
})

export type CreateModuleRequest = z.infer<typeof createModuleRequestSchema>
export type UpdateModuleRequest = z.infer<typeof updateModuleRequestSchema>
export type Module = z.infer<typeof moduleSchema>
export type GetModulesResponse = z.infer<typeof getModulesResponseSchema>
export type CreateModuleResponse = z.infer<typeof createModuleResponseSchema>
export type GetModuleDetailResponse = z.infer<
	typeof getModuleDetailResponseSchema
>
export type UpdateModuleResponse = z.infer<typeof updateModuleResponseSchema>
export type DeleteModuleResponse = z.infer<typeof deleteModuleResponseSchema>
