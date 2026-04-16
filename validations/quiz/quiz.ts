import { z } from "zod"

export const quizUserSchema = z.object({
	userId: z.string(),
	fullName: z.string(),
	email: z.string(),
})

export const createQuizRequestSchema = z.object({
	moduleID: z.string(),
	orderIndex: z.number().int().positive(),
	titleVN: z.string(),
	titleEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	timeLimit: z.number().int().positive(),
	totalScore: z.number().int().positive(),
	passScore: z.number().int().nonnegative(),
})

export const updateQuizRequestSchema = z.object({
	titleVN: z.string(),
	titleEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	timeLimit: z.number().int().positive(),
	totalScore: z.number().int().positive(),
	passScore: z.number().int().nonnegative(),
})

export const quizSchema = z.object({
	quizID: z.string(),
	titleVN: z.string(),
	titleEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	timeLimit: z.number().int().positive(),
	totalScore: z.number().int().positive(),
	passScore: z.number().int().nonnegative(),
	createAt: z.string(),
	creator: quizUserSchema,
	updateAt: z.string(),
	updater: quizUserSchema,
})

export const createQuizResponseSchema = z.object({
	data: quizSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getQuizDetailResponseSchema = z.object({
	data: quizSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const updateQuizResponseSchema = z.object({
	data: quizSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type QuizUser = z.infer<typeof quizUserSchema>
export type CreateQuizRequest = z.infer<typeof createQuizRequestSchema>
export type UpdateQuizRequest = z.infer<typeof updateQuizRequestSchema>
export type Quiz = z.infer<typeof quizSchema>
export type CreateQuizResponse = z.infer<typeof createQuizResponseSchema>
export type GetQuizDetailResponse = z.infer<typeof getQuizDetailResponseSchema>
export type UpdateQuizResponse = z.infer<typeof updateQuizResponseSchema>
