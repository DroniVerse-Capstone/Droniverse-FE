import { z } from "zod"

export const walletSchema = z.object({
	walletID: z.string(),
	ownerID: z.string(),
	ownerName: z.string(),
	bankNumber: z.string().nullable().optional(),
	bank: z.string().nullable().optional(),
	balance: z.number(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export const levelSchema = z.object({
	levelID: z.string(),
	levelNumber: z.number(),
	name: z.string(),
})

export const droneSchema = z.object({
	droneID: z.string(),
	name: z.string(),
	imgURL: z.string().nullable().optional(),
})

export const userLevelSchema = z.object({
	userID: z.string(),
	level: levelSchema,
	drone: droneSchema.nullable().optional(),
})

export const transactionUserSchema = z.object({
	userId: z.string(),
	username: z.string().nullable().optional(),
	firstName: z.string().nullable().optional(),
	lastName: z.string().nullable().optional(),
	email: z.string(),
	dateOfBirth: z.string().nullable().optional(),
	roleName: z.string(),
	imageUrl: z.string().nullable().optional(),
	gender: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
	userLevelMax: z.array(userLevelSchema).nullable().optional(),
	userLevel: z.array(userLevelSchema).nullable().optional(),
})

export const transactionPaymentSchema = z.object({
	orderId: z.string(),
	transactionId: z.string(),
	paymentUrl: z.string().nullable().optional(),
	paymentMethod: z.string(),
	status: z.string(),
	transactionDate: z.string(),
})

export const transactionItemSchema = z.object({
	productID: z.string(),
	productNameVN: z.string(),
	productNameEN: z.string(),
	type: z.string(),
	quantity: z.number(),
})

export const transactionOrderSchema = z.object({
	orderID: z.string(),
	type: z.string(),
	totalAmount: z.number(),
	status: z.string(),
	createAt: z.string(),
	item: transactionItemSchema.nullable().optional(),
	payment: transactionPaymentSchema.nullable().optional(),
	user: transactionUserSchema.nullable().optional(),
})

export const clubSchema = z.object({
	clubID: z.string(),
	nameVN: z.string(),
	nameEN: z.string(),
	imageUrl: z.string().nullable(),
})

export const transactionSchema = z.object({
	transactionID: z.string(),
	wallet: walletSchema.nullable().optional(),
	amount: z.number(),
	type: z.string(),
	club: clubSchema.nullable(),
	referenceID: z.string().nullable().optional(),
	createdAt: z.string(),
	order: transactionOrderSchema.nullable().optional(),
	withdrawRequest: z.any().nullable().optional(),
})

export const getCommissionTransactionsDataSchema = z.object({
	data: z.array(transactionSchema),
	totalRecords: z.number(),
	pageIndex: z.number(),
	pageSize: z.number(),
	totalPages: z.number(),
})

export const getCommissionTransactionsResponseSchema = z.object({
	data: getCommissionTransactionsDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getCommissionTransactionsParamsSchema = z.object({
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(10),
	type: z.literal("COMMISSION").default("COMMISSION"),
})

export type Wallet = z.infer<typeof walletSchema>
export type TransactionUser = z.infer<typeof transactionUserSchema>
export type TransactionOrder = z.infer<typeof transactionOrderSchema>
export type Transaction = z.infer<typeof transactionSchema>
export type  GetCommissionTransactionsData = z.infer<typeof getCommissionTransactionsDataSchema>
export type GetCommissionTransactionsResponse = z.infer<typeof getCommissionTransactionsResponseSchema>
export type GetCommissionTransactionsParams = z.infer<typeof getCommissionTransactionsParamsSchema>
