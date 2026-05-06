import { z } from "zod"

export const assignmentSchema = z.object({
	assignmentID: z.string(),
	titleEN: z.string(),
	titleVN: z.string(),
	descriptionEN: z.string(),
	descriptionVN: z.string(),
	requirement: z.string(),
	estimatedTime: z.number().int().positive(),
	createBy: z.string(),
	updateBy: z.string(),
	createAt: z.string(),
	updateAt: z.string(),
})

export const createAssignmentRequestSchema = z.object({
	titleEN: z.string(),
	titleVN: z.string(),
	descriptionEN: z.string(),
	descriptionVN: z.string(),
	requirement: z.string(),
	estimatedTime: z.number().int().positive(),
	moduleID: z.string(),
	orderIndex: z.number().int().positive(),
})

export const createAssignmentResponseSchema = z.object({
	data: assignmentSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const updateAssignmentRequestSchema = z.object({
	titleEN: z.string(),
	titleVN: z.string(),
	descriptionEN: z.string(),
	descriptionVN: z.string(),
	requirement: z.string(),
	estimatedTime: z.number().int().positive(),
})

export const updateAssignmentResponseSchema = z.object({
	data: assignmentSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getAssignmentDetailResponseSchema = z.object({
	data: assignmentSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type Assignment = z.infer<typeof assignmentSchema>
export type CreateAssignmentRequest = z.infer<
	typeof createAssignmentRequestSchema
>
export type CreateAssignmentResponse = z.infer<
	typeof createAssignmentResponseSchema
>
export type UpdateAssignmentRequest = z.infer<
	typeof updateAssignmentRequestSchema
>
export type UpdateAssignmentResponse = z.infer<
	typeof updateAssignmentResponseSchema
>
export type GetAssignmentDetailResponse = z.infer<
	typeof getAssignmentDetailResponseSchema
>
