import { z } from "zod"

export const enrollmentStatusSchema = z.enum(["ACTIVE", "COMPLETED"])
export const levelSchema = z.enum(["EASY", "MEDIUM", "HARD"])

export const userEnrollmentSchema = z.object({
	enrollmentId: z.string(),
	courseId: z.string().uuid(),
	courseVersionId: z.string().uuid(),
	courseNameVN: z.string(),
	courseNameEN: z.string(),
	imageUrl: z.string().nullable(),
	level: levelSchema,
	estimatedDuration: z.number().int().nonnegative(),
	progress: z.number().min(0).max(100),
	enrollStatus: enrollmentStatusSchema,
})

export const getUserEnrollmentsQuerySchema = z.object({
	clubId: z.string().uuid(),
	level: levelSchema.nullable().optional(),
	courseSearchName: z.string().optional(),
	enrollmentStatus: enrollmentStatusSchema.nullable().optional(),
	currentPage: z.number().int().positive().default(1).optional(),
	pageSize: z.number().int().positive().default(5).optional(),
})

export const getUserEnrollmentsDataSchema = z.object({
	data: z.array(userEnrollmentSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
})

export const getUserEnrollmentsResponseSchema = z.object({
	data: getUserEnrollmentsDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type UserEnrollment = z.infer<typeof userEnrollmentSchema>
export type GetUserEnrollmentsQuery = z.infer<typeof getUserEnrollmentsQuerySchema>
export type GetUserEnrollmentsData = z.infer<typeof getUserEnrollmentsDataSchema>
export type GetUserEnrollmentsResponse = z.infer<typeof getUserEnrollmentsResponseSchema>
export type EnrollmentStatus = z.infer<typeof enrollmentStatusSchema>
export type CourseLevel = z.infer<typeof levelSchema>
