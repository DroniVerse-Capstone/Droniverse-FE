import { z } from "zod"

export const lessonTypeSchema = z.enum(["THEORY", "QUIZ", "LAB", "PHYSIC", "LAB_PHYSIC", "VR", "ASSIGNMENT"])

export const lessonSchema = z.object({
	lessonID: z.string(),
	moduleID: z.string(),
	orderIndex: z.number().int().positive(),
	type: lessonTypeSchema,
	referenceID: z.string(),
	titleVN: z.string(),
	titleEN: z.string(),
	estimatedTime: z.number().int().positive().nullable(),
})

export const getLessonsResponseSchema = z.object({
	data: z.array(lessonSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const importLabLessonRequestSchema = z.object({
	moduleID: z.string(),
	orderIndex: z.number().int().positive(),
	type: lessonTypeSchema,
})

export const importLabLessonResponseSchema = z.object({
	data: lessonSchema,
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
export type ImportLabLessonRequest = z.infer<typeof importLabLessonRequestSchema>
export type ImportLabLessonResponse = z.infer<typeof importLabLessonResponseSchema>
export type DeleteLessonResponse = z.infer<typeof deleteLessonResponseSchema>
