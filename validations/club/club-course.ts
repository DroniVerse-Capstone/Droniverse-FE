import { z } from "zod"

export const clubCourseLevelObjectSchema = z.object({
	levelID: z.string().uuid(),
	levelNumber: z.number().int().nonnegative(),
	name: z.string(),
})

export const clubCourseDroneSchema = z.object({
	droneID: z.string().uuid(),
	name: z.string(),
	imgURL: z.string(),
})


export const participationSortSchema = z.enum([
	"MostPopular",
	"LeastPopular",
])


export const clubCourseOverviewUserSchema = z.object({
	userId: z.string().uuid(),
	fullName: z.string(),
	email: z.string().email(),
})

export const clubCourseOverviewMiniProductSchema = z.object({
	productId: z.string().uuid(),
	referenceId: z.string().uuid(),
	price: z.number().int().nonnegative(),
	currency: z.enum(["USD", "VND"]),
	status: z.enum(["Active", "Inactive"]),
})

export const clubCourseOverviewOwnSchema = z.object({
	remainingQuantity: z.number().int().nonnegative(),
	profitType: z.enum(["PROFIT", "NONPROFIT"]),
})

export const clubCourseOverviewSchema = z.object({
	author: clubCourseOverviewUserSchema,
	enrollmentID: z.string().uuid().nullable(),
	courseID: z.string().uuid(),
	courseVersionID: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	contextVN: z.string(),
	contextEN: z.string(),
	imageUrl: z.string().nullable(),
	level: clubCourseLevelObjectSchema,
	drone: clubCourseDroneSchema.nullable(),
	estimatedDuration: z.number().int().nonnegative(),
	averageRating: z.number().nonnegative(),
	totalFeedback: z.number().int().nonnegative(),
	totalLearners: z.number().int().nonnegative(),
	totalModules: z.number().int().nonnegative(),
	totalTheory: z.number().int().nonnegative(),
	totalQuiz: z.number().int().nonnegative(),
	totalLab: z.number().int().nonnegative(),
	certificateImageUrl: z.string().nullable(),
	isUnlock: z.boolean(),
	lastUpdatedBy: clubCourseOverviewUserSchema.nullable(),
	lastUpdatedAt: z.string().nullable(),
	miniProduct: clubCourseOverviewMiniProductSchema.nullable(),
	clubCourseOwn: clubCourseOverviewOwnSchema.nullable(),
})

export const clubCourseSchema = z.object({
	courseId: z.string().uuid(),
	courseVersionId: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	level: clubCourseLevelObjectSchema,
	drone: clubCourseDroneSchema.nullable(),
	numberOfParticipants: z.number().int().nonnegative(),
	rating: z.number().nonnegative(),
	imageUrl: z.string().nullable(),
	estimatedDuration: z.number().int().nonnegative(),
	price: z.number().int().nonnegative(),
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

export const getClubHotCoursesDataSchema = z.object({
	data: z.array(clubCourseSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
})

export const getClubHotCoursesResponseSchema = z.object({
	data: getClubHotCoursesDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getClubCourseOverviewResponseSchema = z.object({
	data: clubCourseOverviewSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getClubCoursesQuerySchema = z.object({
	levelId: z.string().uuid().nullable().optional(),
	droneId: z.string().uuid().nullable().optional(),
	participationSort: participationSortSchema.nullable().optional(),
	courseName: z.string().trim().min(1).optional(),
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(5),
})

export const getClubHotCoursesQuerySchema = z.object({
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(5),
})

export const getClubCourseOverviewQuerySchema = z.object({
	clubId: z.string().uuid(),
	courseId: z.string().uuid(),
})

export type ParticipationSort = z.infer<typeof participationSortSchema>
export type ClubCourseOverviewUser = z.infer<typeof clubCourseOverviewUserSchema>
export type ClubCourseOverviewMiniProduct = z.infer<
	typeof clubCourseOverviewMiniProductSchema
>
export type ClubCourseOverviewOwn = z.infer<typeof clubCourseOverviewOwnSchema>
export type ClubCourseOverview = z.infer<typeof clubCourseOverviewSchema>
export type ClubCourse = z.infer<typeof clubCourseSchema>
export type GetClubCoursesData = z.infer<typeof getClubCoursesDataSchema>
export type GetClubCoursesResponse = z.infer<typeof getClubCoursesResponseSchema>
export type GetClubCoursesQuery = z.infer<typeof getClubCoursesQuerySchema>
export type GetClubHotCoursesData = z.infer<typeof getClubHotCoursesDataSchema>
export type GetClubHotCoursesResponse = z.infer<
	typeof getClubHotCoursesResponseSchema
>
export type GetClubHotCoursesQuery = z.infer<typeof getClubHotCoursesQuerySchema>
export type GetClubCourseOverviewResponse = z.infer<
	typeof getClubCourseOverviewResponseSchema
>
export type GetClubCourseOverviewQuery = z.infer<
	typeof getClubCourseOverviewQuerySchema
>
export type ClubCourseLevel = string
