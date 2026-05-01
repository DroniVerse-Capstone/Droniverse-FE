import { z } from "zod"

export const userMediaSchema = z.object({
    mediaID: z.string(),
    url: z.string(),
})

export const userSchema = z.object({
    userId: z.string(),
    fullName: z.string(),
    email: z.string().email(),
    avatarUrl: z.string().nullable(),
})

export const userAssignmentAttemptSchema = z.object({
    userAssignmentID: z.string(),
    assignmentID: z.string(),
    enrollmentID: z.string(),
    attemptNumber: z.number().int(),
    media: userMediaSchema.nullable(),
    user: userSchema.nullable(),
    description: z.string().nullable(),
    status: z.enum(["SUBMITTED", "UNDER_REVIEW", "PASSED", "FAILED"]),
    score: z.number().nullable(),
    reviewComment: z.string().nullable(),
    reviewedBy: z.string().nullable(),
    reviewedAt: z.string().nullable(),
    submittedAt: z.string().nullable(),
})

export const userAssignmentStatusSchema = z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "PASSED",
    "FAILED",
])

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

export const reviewUserAssignmentRequestSchema = z.object({
    userId: z.string().uuid(),
    score: z.number().int().min(0).max(100),
    reviewComment: z.string().min(1),
})

export const reviewUserAssignmentResponseSchema = z.object({
    data: z.object({
        userAssignmentID: z.string(),
        assignmentID: z.string(),
        enrollmentID: z.string(),
        score: z.number().nullable(),
        isPassed: z.boolean(),
        status: z.enum(["SUBMITTED", "UNDER_REVIEW", "PASSED", "FAILED"]),
        reviewComment: z.string().nullable(),
        reviewedBy: z.string().nullable(),
        reviewedAt: z.string().nullable(),
    }),
    isSuccess: z.boolean(),
    message: z.string(),
})

export type UserAssignmentAttempt = z.infer<typeof userAssignmentAttemptSchema>
export type UserAssignmentStatus = z.infer<typeof userAssignmentStatusSchema>
export type GetUserAssignmentAttemptsResponse = z.infer<
    typeof getUserAssignmentAttemptsResponseSchema
>
export type ReviewUserAssignmentRequest = z.infer<
    typeof reviewUserAssignmentRequestSchema
>
export type ReviewUserAssignmentResponse = z.infer<
    typeof reviewUserAssignmentResponseSchema
>