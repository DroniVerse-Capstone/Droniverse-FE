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
	status: z.string(),
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

export type WithdrawRequest = z.infer<typeof withdrawRequestSchema>
export type GetMyWithdrawRequestsResponse = z.infer<typeof getMyWithdrawRequestsResponseSchema>

export const createWithdrawRequestSchema = z.object({
	amount: z.number().nonnegative(),
	note: z.string(),
})

export const createWithdrawRequestResponseSchema = z.object({
	data: withdrawRequestSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type CreateWithdrawRequest = z.infer<typeof createWithdrawRequestSchema>
export type CreateWithdrawRequestResponse = z.infer<typeof createWithdrawRequestResponseSchema>
