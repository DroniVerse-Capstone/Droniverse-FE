import { z } from "zod"

export const paymentMethodSchema = z.enum(["CASH", "VNPAY", "PAYOS"])

export const paymentItemTypeSchema = z.enum(["CODE"])

export const createPaymentOrderItemSchema = z.object({
	productID: z.string().uuid(),
	productName: z.string().trim().min(1),
	type: paymentItemTypeSchema,
	unitOfPrice: z.number().int().nonnegative(),
	quantity: z.number().int().positive(),
	total: z.number().int().nonnegative(),
})

export const createPaymentOrderRequestSchema = z.object({
	totalAmount: z.number().int().nonnegative(),
	paymentMethod: paymentMethodSchema,
	item: createPaymentOrderItemSchema,
})

export const paymentOrderStatusSchema = z.enum([
	"PENDING",
	"PAID",
	"FAILED",
	"CANCELLED",
])

export const paymentOrderDataSchema = z.object({
	orderID: z.string().uuid(),
	totalAmount: z.number().int().nonnegative(),
	status: paymentOrderStatusSchema,
	createAt: z.string(),
	item: createPaymentOrderItemSchema.nullable(),
})

export const createPaymentOrderResponseSchema = z.object({
	data: paymentOrderDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const paymentDetailDataSchema = z.object({
	orderId: z.string().uuid(),
	transactionId: z.string().uuid(),
	paymentUrl: z.string().url(),
	paymentMethod: paymentMethodSchema,
	status: paymentOrderStatusSchema,
	transactionDate: z.string(),
})

export const getPaymentDetailResponseSchema = z.object({
	data: paymentDetailDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getPaymentDetailQuerySchema = z.object({
	orderId: z.string().uuid(),
})

export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type PaymentItemType = z.infer<typeof paymentItemTypeSchema>
export type CreatePaymentOrderItem = z.infer<typeof createPaymentOrderItemSchema>
export type CreatePaymentOrderRequest = z.infer<
	typeof createPaymentOrderRequestSchema
>
export type PaymentOrderStatus = z.infer<typeof paymentOrderStatusSchema>
export type PaymentOrderData = z.infer<typeof paymentOrderDataSchema>
export type CreatePaymentOrderResponse = z.infer<
	typeof createPaymentOrderResponseSchema
>
export type PaymentDetailData = z.infer<typeof paymentDetailDataSchema>
export type GetPaymentDetailResponse = z.infer<typeof getPaymentDetailResponseSchema>
export type GetPaymentDetailQuery = z.infer<typeof getPaymentDetailQuerySchema>
