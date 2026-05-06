import { z } from "zod"

export const courseVersionFeedbackParamsSchema = z.object({
	courseId: z.string().uuid(),
	versionId: z.string().uuid(),
})

export const courseVersionFeedbackUpdateParamsSchema = z.object({
	courseId: z.string().uuid(),
	versionId: z.string().uuid(),
	feedbackId: z.string().uuid(),
})

export const courseVersionFeedbackDeleteParamsSchema =
	courseVersionFeedbackUpdateParamsSchema

export const courseVersionFeedbackUserSchema = z.object({
	userId: z.string().uuid(),
	fullName: z.string(),
	email: z.string().email(),
	avatarUrl: z.string().nullable(),
})

export const courseVersionFeedbackSchema = z.object({
	feedbackID: z.string().uuid(),
	user: courseVersionFeedbackUserSchema,
	rating: z.number().int().min(1).max(5),
	content: z.string(),
	createAt: z.string(),
})

export const createCourseVersionFeedbackRequestSchema = z.object({
	rating: z.number().int().min(1).max(5),
	content: z.string().trim().min(1),
})

export const createCourseVersionFeedbackResponseSchema = z.object({
	data: courseVersionFeedbackSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const updateCourseVersionFeedbackRequestSchema = z.object({
	rating: z.number().int().min(1).max(5),
	content: z.string().trim().min(1),
})

export const updateCourseVersionFeedbackResponseSchema = z.object({
	data: courseVersionFeedbackSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const deleteCourseVersionFeedbackResponseSchema = z.object({
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getCourseVersionFeedbacksResponseSchema = z.object({
	data: z.array(courseVersionFeedbackSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type CourseVersionFeedbackParams = z.infer<
	typeof courseVersionFeedbackParamsSchema
>
export type CourseVersionFeedbackUpdateParams = z.infer<
	typeof courseVersionFeedbackUpdateParamsSchema
>
export type CourseVersionFeedbackDeleteParams = z.infer<
	typeof courseVersionFeedbackDeleteParamsSchema
>
export type CourseVersionFeedbackUser = z.infer<
	typeof courseVersionFeedbackUserSchema
>
export type CourseVersionFeedback = z.infer<typeof courseVersionFeedbackSchema>
export type CreateCourseVersionFeedbackRequest = z.infer<
	typeof createCourseVersionFeedbackRequestSchema
>
export type CreateCourseVersionFeedbackResponse = z.infer<
	typeof createCourseVersionFeedbackResponseSchema
>
export type UpdateCourseVersionFeedbackRequest = z.infer<
	typeof updateCourseVersionFeedbackRequestSchema
>
export type UpdateCourseVersionFeedbackResponse = z.infer<
	typeof updateCourseVersionFeedbackResponseSchema
>
export type DeleteCourseVersionFeedbackResponse = z.infer<
	typeof deleteCourseVersionFeedbackResponseSchema
>
export type GetCourseVersionFeedbacksResponse = z.infer<
	typeof getCourseVersionFeedbacksResponseSchema
>
