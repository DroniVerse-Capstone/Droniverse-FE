import { z } from "zod"

export const walletDataSchema = z.object({
	walletID: z.string().uuid(),
	ownerID: z.string().uuid(),
	ownerName: z.string().trim().min(1),
	bankNumber: z.string().trim().min(1),
	bank: z.string().trim().min(1),
	balance: z.number().nonnegative(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export const getMyWalletResponseSchema = z.object({
	data: walletDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ---- Get wallet by id ----
export const getWalletByIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export const getWalletByIdResponseSchema = getMyWalletResponseSchema

// ---- Create wallet ----
export const createWalletRequestSchema = z.object({
    bankNumber: z.string().trim().min(1),
    bank: z.string().trim().min(1),
})

export const createWalletResponseSchema = getMyWalletResponseSchema

export type WalletData = z.infer<typeof walletDataSchema>
export type GetMyWalletResponse = z.infer<typeof getMyWalletResponseSchema>
export type CreateWalletRequest = z.infer<typeof createWalletRequestSchema>
export type CreateWalletResponse = z.infer<typeof createWalletResponseSchema>
export type GetWalletByIdParams = z.infer<typeof getWalletByIdParamsSchema>
export type GetWalletByIdResponse = z.infer<typeof getWalletByIdResponseSchema>
// ---- Update wallet ----
export const updateWalletRequestSchema = createWalletRequestSchema
export const updateWalletResponseSchema = getMyWalletResponseSchema

export type UpdateWalletRequest = z.infer<typeof updateWalletRequestSchema>
export type UpdateWalletResponse = z.infer<typeof updateWalletResponseSchema>

// ---- Withdraw Requests ----
export const withdrawRequestSchema = z.object({
	withdrawID: z.string().uuid(),
	amount: z.number().nonnegative(),
	status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
	approvedAt: z.string().nullable(),
	requesterID: z.string().uuid(),
	approverID: z.string().uuid().nullable(),
	note: z.string().nullable(),
	rejectReason: z.string().nullable(),
	wallet: walletDataSchema.nullable(),
})

export const getMyWithdrawRequestsResponseSchema = z.object({
	data: z.array(withdrawRequestSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getWithdrawRequestsDataSchema = z.object({
	data: z.array(withdrawRequestSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
})

export const getWithdrawRequestsResponseSchema = z.object({
	data: getWithdrawRequestsDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getWithdrawRequestsParamsSchema = z.object({
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(10),
	status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
})

export type WithdrawRequest = z.infer<typeof withdrawRequestSchema>
export type GetMyWithdrawRequestsResponse = z.infer<typeof getMyWithdrawRequestsResponseSchema>
export type GetWithdrawRequestsData = z.infer<typeof getWithdrawRequestsDataSchema>
export type GetWithdrawRequestsResponse = z.infer<typeof getWithdrawRequestsResponseSchema>
export type GetWithdrawRequestsParams = z.infer<typeof getWithdrawRequestsParamsSchema>

export const createWithdrawRequestSchema = z.object({
	amount: z.number().min(50000),
	note: z.string(),
})

export const createWithdrawRequestResponseSchema = z.object({
	data: withdrawRequestSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type CreateWithdrawRequest = z.infer<typeof createWithdrawRequestSchema>
export type CreateWithdrawRequestResponse = z.infer<typeof createWithdrawRequestResponseSchema>

// ---- Update Withdraw Request Status ----
export const updateWithdrawRequestStatusRequestSchema = z.object({
	status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
	rejectReason: z.string().nullable(),
})

export const updateWithdrawRequestStatusResponseSchema = z.object({
	data: withdrawRequestSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type UpdateWithdrawRequestStatusRequest = z.infer<typeof updateWithdrawRequestStatusRequestSchema>
export type UpdateWithdrawRequestStatusResponse = z.infer<typeof updateWithdrawRequestStatusResponseSchema>
