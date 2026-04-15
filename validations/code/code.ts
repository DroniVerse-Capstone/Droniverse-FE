import { z } from "zod"

export const codeUseStateSchema = z.enum(["UnUse", "Used"])

export const codeOwnStateSchema = z.enum(["UnUserOwned", "UserOwned"])

export const userCodesStateSchema = z.enum(["User_No_Codes", "User_Has_Codes"])

export const getCourseCodesByClubParamsSchema = z.object({
	clubId: z.string().uuid(),
	courseId: z.string().uuid(),
})

export const getCourseCodesByClubQuerySchema = z.object({
	codeUseState: codeUseStateSchema.optional(),
	codeOwnState: codeOwnStateSchema.optional(),
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(5),
})

export const codeCourseInfoSchema = z.object({
	courseId: z.string().uuid(),
	courseNameVN: z.string(),
	courseNameEN: z.string(),
	imageUrl: z.string().nullable(),
})

export const codeUserInfoSchema = z.object({
	userId: z.string().uuid(),
	fullName: z.string(),
	email: z.string().email(),
	avatarUrl: z.string().nullable(),
})

export const codeItemSchema = z.object({
	code: z.string(),
	ownerInfo: codeUserInfoSchema.nullable(),
	comsumerInfo: codeUserInfoSchema.nullable(),
	expireDate: z.string(),
})

export const codeItemsPagingSchema = z.object({
	data: z.array(codeItemSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
})

export const getCourseCodesByClubDataSchema = z.object({
	clubID: z.string().uuid(),
	courseInfo: codeCourseInfoSchema,
	codesItem: codeItemsPagingSchema,
})

export const getCourseCodesByClubResponseSchema = z.object({
	data: getCourseCodesByClubDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ---- Get Course Users Codes By Club ----

export const getCourseUsersCodesByClubParamsSchema = z.object({
	clubId: z.string().uuid(),
	courseId: z.string().uuid(),
})

export const getCourseUsersCodesByClubQuerySchema = z.object({
	fullName: z.string().trim().optional(),
	email: z.string().trim().optional(),
	userCodes: userCodesStateSchema.optional(),
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(5),
})

export const courseCodeUserItemSchema = z.object({
	userId: z.string().uuid(),
	fullName: z.string(),
	email: z.string().email(),
	avatarUrl: z.string().nullable(),
})

export const courseCodeUsersPagingSchema = z.object({
	data: z.array(courseCodeUserItemSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
})

export const getCourseUsersCodesByClubResponseSchema = z.object({
	data: courseCodeUsersPagingSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ---- Generate Codes ----

export const generateCodesRequestSchema = z.object({
	clubId: z.string().uuid(),
	courseId: z.string().uuid(),
	quantity: z.number().int().positive(),
})

export const generatedClubCourseSchema = z.object({
	clubId: z.string().uuid(),
	courseId: z.string().uuid(),
	totalQuantity: z.number().int().nonnegative(),
	remainingQuantity: z.number().int().nonnegative(),
	profitType: z.string(),
	isAvailable: z.boolean(),
})

export const generateCodesResponseSchema = z.object({
	createdCode: z.number().int().nonnegative(),
	clubCourse: generatedClubCourseSchema,
})

export type CodeUseState = z.infer<typeof codeUseStateSchema>
export type CodeOwnState = z.infer<typeof codeOwnStateSchema>
export type UserCodesState = z.infer<typeof userCodesStateSchema>
export type GetCourseCodesByClubParams = z.infer<
	typeof getCourseCodesByClubParamsSchema
>
export type GetCourseCodesByClubQuery = z.infer<
	typeof getCourseCodesByClubQuerySchema
>
export type CodeCourseInfo = z.infer<typeof codeCourseInfoSchema>
export type CodeUserInfo = z.infer<typeof codeUserInfoSchema>
export type CodeItem = z.infer<typeof codeItemSchema>
export type CodeItemsPaging = z.infer<typeof codeItemsPagingSchema>
export type GetCourseCodesByClubData = z.infer<typeof getCourseCodesByClubDataSchema>
export type GetCourseCodesByClubResponse = z.infer<
	typeof getCourseCodesByClubResponseSchema
>
export type GetCourseUsersCodesByClubParams = z.infer<
	typeof getCourseUsersCodesByClubParamsSchema
>
export type GetCourseUsersCodesByClubQuery = z.infer<
	typeof getCourseUsersCodesByClubQuerySchema
>
export type CourseCodeUserItem = z.infer<typeof courseCodeUserItemSchema>
export type CourseCodeUsersPaging = z.infer<typeof courseCodeUsersPagingSchema>
export type GetCourseUsersCodesByClubResponse = z.infer<
	typeof getCourseUsersCodesByClubResponseSchema
>
export type GenerateCodesRequest = z.infer<typeof generateCodesRequestSchema>
export type GeneratedClubCourse = z.infer<typeof generatedClubCourseSchema>
export type GenerateCodesResponse = z.infer<typeof generateCodesResponseSchema>
