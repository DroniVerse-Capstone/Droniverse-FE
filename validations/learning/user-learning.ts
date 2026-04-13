import { z } from "zod"

export const lessonTypeSchema = z.enum(["THEORY", "QUIZ", "LAB"])

export const lessonSchema = z.object({
	lessonID: z.string().uuid(),
	orderIndex: z.number().int().positive(),
	type: lessonTypeSchema,
	referenceID: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	duration: z.number().int().nonnegative(),
	progress: z.number().min(0).max(100),
	isCompleted: z.boolean(),
	isLocked: z.boolean(),
	lastAccessDate: z.string().nullable(),
})

export const moduleSchema = z.object({
	moduleID: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	moduleNumber: z.number().int().positive(),
	totalLessons: z.number().int().nonnegative(),
	duration: z.number().int().nonnegative(),
	progress: z.number().min(0).max(100),
	isCompleted: z.boolean(),
	isLocked: z.boolean(),
	lessons: z.array(lessonSchema),
})

export const userLearningPathSchema = z.object({
	enrollmentID: z.string().uuid(),
	courseID: z.string().uuid(),
	courseVersionID: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	totalLessons: z.number().int().nonnegative(),
	duration: z.number().int().nonnegative(),
	progress: z.number().min(0).max(100),
	modules: z.array(moduleSchema),
})

export const getUserLearningPathResponseSchema = z.object({
	data: userLearningPathSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const userLessonStatusSchema = z.enum([
	"INCOMPLETED",
	"IN_PROGRESS",
	"COMPLETED",
])

export const userLessonSchema = z.object({
	userLessonID: z.string().uuid(),
	lessonID: z.string().uuid(),
	userID: z.string().uuid(),
	status: userLessonStatusSchema,
	progress: z.number().min(0).max(100),
	lastAccessDate: z.string().nullable(),
})

export const createUserLessonDataParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	lessonId: z.string().uuid(),
})

export const createUserLessonDataResponseSchema = z.object({
	data: userLessonSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const checkUserLessonExistsParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	lessonId: z.string().uuid(),
})

export const checkUserLessonExistsResponseSchema = z.object({
	data: z.boolean(),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type Lesson = z.infer<typeof lessonSchema>
export type Module = z.infer<typeof moduleSchema>
export type UserLearningPath = z.infer<typeof userLearningPathSchema>
export type GetUserLearningPathResponse = z.infer<typeof getUserLearningPathResponseSchema>
export type LessonType = z.infer<typeof lessonTypeSchema>
export type UserLessonStatus = z.infer<typeof userLessonStatusSchema>
export type UserLesson = z.infer<typeof userLessonSchema>
export type CreateUserLessonDataParams = z.infer<
	typeof createUserLessonDataParamsSchema
>
export type CreateUserLessonDataResponse = z.infer<
	typeof createUserLessonDataResponseSchema
>
export type CheckUserLessonExistsParams = z.infer<
	typeof checkUserLessonExistsParamsSchema
>
export type CheckUserLessonExistsResponse = z.infer<
	typeof checkUserLessonExistsResponseSchema
>
