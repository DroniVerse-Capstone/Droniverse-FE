import { z } from "zod"

export const lessonTypeSchema = z.enum(["THEORY", "QUIZ", "LAB"])

export const lessonSchema = z.object({
	lessonID: z.string(),
	moduleID: z.string(),
	orderIndex: z.number().int().positive(),
	type: lessonTypeSchema,
	referenceID: z.string(),
	titleVN: z.string(),
	titleEN: z.string(),
	estimatedTime: z.number().int().positive(),
})

export const getLessonsResponseSchema = z.object({
	data: z.array(lessonSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const deleteLessonResponseSchema = z.object({
	isSuccess: z.boolean(),
	message: z.string(),
})

export type LessonType = z.infer<typeof lessonTypeSchema>
export type Lesson = z.infer<typeof lessonSchema>
export type GetLessonsResponse = z.infer<typeof getLessonsResponseSchema>
export type DeleteLessonResponse = z.infer<typeof deleteLessonResponseSchema>
