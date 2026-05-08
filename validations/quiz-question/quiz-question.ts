import { z } from "zod"

export const quizQuestionTemplateResponseSchema = z.custom<Blob>(
	(value) => typeof Blob !== "undefined" && value instanceof Blob,
	"Template file is required",
)

export const importQuizQuestionRequestSchema = z.custom<File>(
	(value) => typeof File !== "undefined" && value instanceof File,
	"Quiz question import file is required",
)

export const importQuizQuestionResponseSchema = z.object({
	total: z.number().int().nonnegative(),
	success: z.number().int().nonnegative(),
	failed: z.number().int().nonnegative(),
	errors: z.array(z.unknown()),
})

export const quizQuestionSchema = z.object({
	questionID: z.string(),
	quizID: z.string(),
	contentVN: z.string(),
	contentEN: z.string(),
	answerA: z.string(),
	answerB: z.string(),
	answerC: z.string(),
	answerD: z.string(),
	answerA_EN: z.string(),
	answerB_EN: z.string(),
	answerC_EN: z.string(),
	answerD_EN: z.string(),
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
	answerA_EN: z.string(),
	answerB_EN: z.string(),
	answerC_EN: z.string(),
	answerD_EN: z.string(),
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
	answerA_EN: z.string(),
	answerB_EN: z.string(),
	answerC_EN: z.string(),
	answerD_EN: z.string(),
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
export type QuizQuestionTemplateResponse = z.infer<
	typeof quizQuestionTemplateResponseSchema
>
export type ImportQuizQuestionRequest = z.infer<
	typeof importQuizQuestionRequestSchema
>
export type ImportQuizQuestionResponse = z.infer<
	typeof importQuizQuestionResponseSchema
>
