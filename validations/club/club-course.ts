import { z } from "zod"

export const clubCourseLevelSchema = z.enum(["EASY", "MEDIUM", "HARD"])

export const participationSortSchema = z.enum([
	"MostPopular",
	"LeastPopular",
])

export const courseOwnerSchema = z.enum(["All", "Owned", "NotOwned"])

export const clubCourseOwnedSchema = z.object({
	remainingCode: z.number().int().nonnegative(),
	profitType: z.enum(["PROFIT", "NONPROFIT"]),
})

export const clubCourseSchema = z.object({
	courseId: z.string().uuid(),
	courseVersionId: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	level: clubCourseLevelSchema,
	numberOfParticipants: z.number().int().nonnegative(),
	rating: z.number().nonnegative(),
	imageUrl: z.string(),
	estimatedDuration: z.number().int().nonnegative(),
	price: z.number().int().nonnegative(),
	clubCourseOwned: clubCourseOwnedSchema.nullable(),
})

export const getClubCoursesDataSchema = z.object({
	data: z.array(clubCourseSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
})

export const getClubCoursesResponseSchema = z.object({
	data: getClubCoursesDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getClubCoursesQuerySchema = z.object({
	level: clubCourseLevelSchema.nullable().optional(),
	participationSort: participationSortSchema.nullable().optional(),
	courseOwner: courseOwnerSchema.nullable().optional(),
	courseName: z.string().trim().min(1).optional(),
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(5),
})

export type ClubCourseLevel = z.infer<typeof clubCourseLevelSchema>
export type ParticipationSort = z.infer<typeof participationSortSchema>
export type CourseOwner = z.infer<typeof courseOwnerSchema>
export type ClubCourseOwned = z.infer<typeof clubCourseOwnedSchema>
export type ClubCourse = z.infer<typeof clubCourseSchema>
export type GetClubCoursesData = z.infer<typeof getClubCoursesDataSchema>
export type GetClubCoursesResponse = z.infer<typeof getClubCoursesResponseSchema>
export type GetClubCoursesQuery = z.infer<typeof getClubCoursesQuerySchema>
