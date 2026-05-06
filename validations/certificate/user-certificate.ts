import { z } from "zod"

export const userCertificateSchema = z.object({
	certificateID: z.string().uuid(),
	userID: z.string().uuid(),
	certificateUrl: z.string().url(),
	achievedDate: z.string(),
	status: z.enum(["ACHIEVED", "REVOKED"]),
})

export const getUserCertificatesParamsSchema = z.object({
	pageIndex: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(50),
})

export const getUserCertificatesDataSchema = z.object({
	data: z.array(userCertificateSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
})

export const getUserCertificatesResponseSchema = z.object({
	data: getUserCertificatesDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type UserCertificate = z.infer<typeof userCertificateSchema>
export type GetUserCertificatesParams = z.infer<typeof getUserCertificatesParamsSchema>
export type GetUserCertificatesData = z.infer<typeof getUserCertificatesDataSchema>
export type GetUserCertificatesResponse = z.infer<typeof getUserCertificatesResponseSchema>
