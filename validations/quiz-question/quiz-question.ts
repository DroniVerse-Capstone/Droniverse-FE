import { z } from "zod"

export const quizQuestionSchema = z.object({
	questionID: z.string(),
	quizID: z.string(),
	contentVN: z.string(),
	contentEN: z.string(),
	answerA: z.string(),
	answerB: z.string(),
	answerC: z.string(),
	answerD: z.string(),
	correctAnswer: z.enum(["A", "B", "C", "D"]),
	score: z.number().int().positive(),
})

export const getQuizQuestionsResponseSchema = z.object({
	data: z.array(quizQuestionSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const createQuizQuestionRequestSchema = z.object({
	contentVN: z.string(),
	contentEN: z.string(),
	answerA: z.string(),
	answerB: z.string(),
	answerC: z.string(),
	answerD: z.string(),
	correctAnswer: z.enum(["A", "B", "C", "D"]),
	score: z.number().int().positive(),
})

export const updateQuizQuestionRequestSchema = z.object({
	contentVN: z.string(),
	contentEN: z.string(),
	answerA: z.string(),
	answerB: z.string(),
	answerC: z.string(),
	answerD: z.string(),
	correctAnswer: z.enum(["A", "B", "C", "D"]),
	score: z.number().int().positive(),
})

export const createQuizQuestionResponseSchema = z.object({
	data: quizQuestionSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const updateQuizQuestionResponseSchema = z.object({
	data: quizQuestionSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const deleteQuizQuestionResponseSchema = z.object({
	isSuccess: z.boolean(),
	message: z.string(),
})

export type QuizQuestion = z.infer<typeof quizQuestionSchema>
export type GetQuizQuestionsResponse = z.infer<
	typeof getQuizQuestionsResponseSchema
>
export type CreateQuizQuestionRequest = z.infer<
	typeof createQuizQuestionRequestSchema
>
export type CreateQuizQuestionResponse = z.infer<
	typeof createQuizQuestionResponseSchema
>
export type UpdateQuizQuestionRequest = z.infer<
	typeof updateQuizQuestionRequestSchema
>
export type UpdateQuizQuestionResponse = z.infer<
	typeof updateQuizQuestionResponseSchema
>
export type DeleteQuizQuestionResponse = z.infer<
	typeof deleteQuizQuestionResponseSchema
>
