import { z } from "zod"

export const userAssignmentAttemptSchema = z.object({
	userAssignmentID: z.string(),
	assignmentID: z.string(),
	enrollmentID: z.string(),
	attemptNumber: z.number().int(),
	mediaID: z.string().nullable(),
	description: z.string().nullable(),
	status: z.string(),
	score: z.number().nullable(),
	reviewComment: z.string().nullable(),
	reviewedBy: z.string().nullable(),
	reviewedAt: z.string().nullable(),
	submittedAt: z.string().nullable(),
})

export const getUserAssignmentAttemptsResponseSchema = z.object({
	data: z.object({
		data: z.array(userAssignmentAttemptSchema),
		totalRecords: z.number().int(),
		pageIndex: z.number().int(),
		pageSize: z.number().int(),
		totalPages: z.number().int(),
	}),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type UserAssignmentAttempt = z.infer<typeof userAssignmentAttemptSchema>
export type GetUserAssignmentAttemptsResponse = z.infer<
	typeof getUserAssignmentAttemptsResponseSchema
>
