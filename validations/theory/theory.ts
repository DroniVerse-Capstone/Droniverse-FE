import { z } from "zod"

export const theoryUserSchema = z.object({
	userId: z.string(),
	fullName: z.string(),
	email: z.string(),
})

export const createTheoryRequestSchema = z.object({
	moduleID: z.string(),
	orderIndex: z.number().int().positive(),
	titleVN: z.string(),
	titleEN: z.string(),
	contentVN: z.string(),
	contentEN: z.string(),
	estimatedTime: z.number().int().positive(),
})

export const updateTheoryRequestSchema = z.object({
	titleVN: z.string(),
	titleEN: z.string(),
	contentVN: z.string(),
	contentEN: z.string(),
	estimatedTime: z.number().int().positive(),
})

export const theorySchema = z.object({
	theoryID: z.string(),
	titleVN: z.string(),
	titleEN: z.string(),
	contentVN: z.string(),
	contentEN: z.string(),
	estimatedTime: z.number().int().positive(),
	createAt: z.string(),
	creator: theoryUserSchema,
	updateAt: z.string(),
	updater: theoryUserSchema,
})

export const createTheoryResponseSchema = z.object({
	data: theorySchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getTheoryDetailResponseSchema = z.object({
	data: theorySchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const updateTheoryResponseSchema = z.object({
	data: theorySchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type TheoryUser = z.infer<typeof theoryUserSchema>
export type CreateTheoryRequest = z.infer<typeof createTheoryRequestSchema>
export type UpdateTheoryRequest = z.infer<typeof updateTheoryRequestSchema>
export type Theory = z.infer<typeof theorySchema>
export type CreateTheoryResponse = z.infer<typeof createTheoryResponseSchema>
export type GetTheoryDetailResponse = z.infer<typeof getTheoryDetailResponseSchema>
export type UpdateTheoryResponse = z.infer<typeof updateTheoryResponseSchema>
