import { z } from "zod"

export const clubCourseManagementLevelSchema = z.enum(["EASY", "MEDIUM", "HARD"])

export const clubCourseManagementProfitTypeSchema = z.enum([
	"NONPROFIT",
	"PROFIT",
])

export const clubCourseManagementSortBySchema = z.enum([
	"Total_Codes_Quantity",
	"Remaining_Codes_Quantity",
	"Participants_Quantity",
])

export const clubCourseManagementSortDirectionSchema = z.enum(["Asc", "Desc"])

export const clubCourseManagementInfoSchema = z.object({
	totalCode: z.number().int().nonnegative(),
	remainingCode: z.number().int().nonnegative(),
	profitType: clubCourseManagementProfitTypeSchema,
})

export const clubCourseManagementItemSchema = z.object({
	courseId: z.string().uuid(),
	courseVersionId: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	imageUrl: z.string().nullable(),
	level: clubCourseManagementLevelSchema,
	estimatedDuration: z.number().int().nonnegative(),
	numberOfParticipants: z.number().int().nonnegative(),
	clubCourseInfo: clubCourseManagementInfoSchema,
	price: z.number().int().nonnegative(),
})

export const getClubCourseManagementDataSchema = z.object({
	data: z.array(clubCourseManagementItemSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
})

export const getClubCourseManagementResponseSchema = z.object({
	data: getClubCourseManagementDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getClubCourseManagementQuerySchema = z.object({
	level: clubCourseManagementLevelSchema.nullable().optional(),
	profitType: clubCourseManagementProfitTypeSchema.nullable().optional(),
	courseSortBy: clubCourseManagementSortBySchema.nullable().optional(),
	courseSortDirection:
		clubCourseManagementSortDirectionSchema.nullable().optional(),
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(5),
})

export type ClubCourseManagementLevel = z.infer<
	typeof clubCourseManagementLevelSchema
>
export type ClubCourseManagementProfitType = z.infer<
	typeof clubCourseManagementProfitTypeSchema
>
export type ClubCourseManagementSortBy = z.infer<
	typeof clubCourseManagementSortBySchema
>
export type ClubCourseManagementSortDirection = z.infer<
	typeof clubCourseManagementSortDirectionSchema
>
export type ClubCourseManagementInfo = z.infer<
	typeof clubCourseManagementInfoSchema
>
export type ClubCourseManagementItem = z.infer<
	typeof clubCourseManagementItemSchema
>
export type GetClubCourseManagementData = z.infer<
	typeof getClubCourseManagementDataSchema
>
export type GetClubCourseManagementResponse = z.infer<
	typeof getClubCourseManagementResponseSchema
>
export type GetClubCourseManagementQuery = z.infer<
	typeof getClubCourseManagementQuerySchema
>
