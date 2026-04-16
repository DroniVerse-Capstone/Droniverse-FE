import { z } from "zod"

export const codeUseStateSchema = z.enum(["UnUse", "Used"])

export const codeOwnStateSchema = z.enum(["UnUserOwned", "UserOwned"])

export const userCodesStateSchema = z.enum(["User_No_Codes", "User_Has_Codes"])

export const codeProfitTypeSchema = z.enum(["PROFIT", "NONPROFIT"])

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

// ---- Get Club Course Code Summary ----

export const getClubCourseCodeSummaryParamsSchema = z.object({
	clubId: z.string().uuid(),
	courseId: z.string().uuid(),
})

export const clubCourseCodeSummarySchema = z.object({
	remainingQuantity: z.number().int().nonnegative(),
	totalQuantity: z.number().int().nonnegative(),
	profitType: codeProfitTypeSchema,
})

// ---- Update Club Course Profit Type ----

export const updateClubCourseProfitTypeRequestSchema = z.object({
	profitType: codeProfitTypeSchema,
})

export const updateClubCourseProfitTypeDataSchema = z.object({
	clubId: z.string().uuid(),
	courseId: z.string().uuid(),
	totalQuantity: z.number().int().nonnegative(),
	remainingQuantity: z.number().int().nonnegative(),
	profitType: codeProfitTypeSchema,
	isAvailable: z.boolean(),
})

export const updateClubCourseProfitTypeResponseSchema = z.object({
	data: updateClubCourseProfitTypeDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ---- Assign Code To User ----

export const assignCodeToUserRequestSchema = z.object({
	codeId: z.string().trim().min(1),
	userId: z.string().uuid(),
	sendEmail: z.boolean(),
})

export const assignCodeToUserDataSchema = z.object({
	codeId: z.string(),
	userId: z.string().uuid(),
	assignedAt: z.string().trim().min(1),
})

export const assignCodeToUserResponseSchema = z.object({
	data: assignCodeToUserDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ---- Bulk Assign Codes To Users ----

export const bulkAssignCodeItemSchema = z.object({
	codeId: z.string().trim().min(1),
	userId: z.string().uuid(),
})

export const bulkAssignCodesRequestSchema = z.object({
	items: z.array(bulkAssignCodeItemSchema).min(1),
	sendEmail: z.boolean(),
})

export const bulkAssignedCodeItemSchema = z.object({
	codeId: z.string(),
	userId: z.string().uuid(),
	assignedAt: z.string().trim().min(1),
})

export const bulkAssignCodesDataSchema = z.object({
	totalAssigned: z.number().int().nonnegative(),
	assignedItems: z.array(bulkAssignedCodeItemSchema),
})

export const bulkAssignCodesResponseSchema = z.object({
	data: bulkAssignCodesDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ---- Enter Course Code ----

export const enterCourseCodeParamsSchema = z.object({
	clubId: z.string().uuid(),
})

export const enterCourseCodeRequestSchema = z.object({
	codeId: z.string().trim().min(1),
})

export const enterCourseCodeDataSchema = z.object({
	codeID: z.string().trim().min(1),
	userID: z.string().uuid(),
	usedDate: z.string().trim().min(1),
})

export const enterCourseCodeResponseSchema = z.object({
	data: enterCourseCodeDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ---- Receive Course Code ----

export const receiveCourseCodeParamsSchema = z.object({
	clubId: z.string().uuid(),
	courseId: z.string().uuid(),
})

export const receiveCourseCodeDataSchema = z.object({
	remainingCode: z.number().int().nonnegative(),
})

export const receiveCourseCodeResponseSchema = z.object({
	data: receiveCourseCodeDataSchema,
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
export type CodeProfitType = z.infer<typeof codeProfitTypeSchema>
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
export type GetClubCourseCodeSummaryParams = z.infer<
	typeof getClubCourseCodeSummaryParamsSchema
>
export type ClubCourseCodeSummary = z.infer<typeof clubCourseCodeSummarySchema>
export type UpdateClubCourseProfitTypeRequest = z.infer<
	typeof updateClubCourseProfitTypeRequestSchema
>
export type UpdateClubCourseProfitTypeData = z.infer<
	typeof updateClubCourseProfitTypeDataSchema
>
export type UpdateClubCourseProfitTypeResponse = z.infer<
	typeof updateClubCourseProfitTypeResponseSchema
>
export type AssignCodeToUserRequest = z.infer<typeof assignCodeToUserRequestSchema>
export type AssignCodeToUserData = z.infer<typeof assignCodeToUserDataSchema>
export type AssignCodeToUserResponse = z.infer<typeof assignCodeToUserResponseSchema>
export type BulkAssignCodeItem = z.infer<typeof bulkAssignCodeItemSchema>
export type BulkAssignCodesRequest = z.infer<typeof bulkAssignCodesRequestSchema>
export type BulkAssignedCodeItem = z.infer<typeof bulkAssignedCodeItemSchema>
export type BulkAssignCodesData = z.infer<typeof bulkAssignCodesDataSchema>
export type BulkAssignCodesResponse = z.infer<typeof bulkAssignCodesResponseSchema>
export type EnterCourseCodeParams = z.infer<typeof enterCourseCodeParamsSchema>
export type EnterCourseCodeRequest = z.infer<typeof enterCourseCodeRequestSchema>
export type EnterCourseCodeData = z.infer<typeof enterCourseCodeDataSchema>
export type EnterCourseCodeResponse = z.infer<typeof enterCourseCodeResponseSchema>
export type ReceiveCourseCodeParams = z.infer<typeof receiveCourseCodeParamsSchema>
export type ReceiveCourseCodeData = z.infer<typeof receiveCourseCodeDataSchema>
export type ReceiveCourseCodeResponse = z.infer<
	typeof receiveCourseCodeResponseSchema
>
export type GenerateCodesRequest = z.infer<typeof generateCodesRequestSchema>
export type GeneratedClubCourse = z.infer<typeof generatedClubCourseSchema>
export type GenerateCodesResponse = z.infer<typeof generateCodesResponseSchema>
