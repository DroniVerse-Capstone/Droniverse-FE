import { z } from "zod";

import { userLevelSchema } from "@/validations/auth";

export const orderItemSchema = z.object({
	productID: z.string().uuid(),
	productNameVN: z.string().trim().min(1),
	productNameEN: z.string().trim().min(1),
	type: z.string().trim().min(1),
	quantity: z.number().int().positive(),
});

export const orderPaymentSchema = z.object({
	orderId: z.string().uuid(),
	transactionId: z.string().uuid(),
	paymentUrl: z.string().url(),
	paymentMethod: z.string().trim().min(1),
	status: z.enum(["PENDING", "SUCCESS", "FAILED"]),
	transactionDate: z.string(),
});

export const orderUserSchema = z.object({
	userId: z.string().uuid(),
	username: z.string().trim().min(1),
	firstName: z.string().trim().min(1),
	lastName: z.string().trim().min(1),
	email: z.string().email(),
	dateOfBirth: z.string(),
	roleName: z.string().trim().min(1),
	imageUrl: z.string().url().nullable().optional(),
	gender: z.string().trim().min(1).nullable().optional(),
	phone: z.string().trim().min(1).nullable().optional(),
	userLevelMax: z.array(userLevelSchema).nullable().optional(),
	userLevel: z.array(userLevelSchema).nullable().optional(),
});

export const orderDataSchema = z.object({
	orderID: z.string().uuid(),
	type: z.string().trim().min(1),
	totalAmount: z.number().int().nonnegative(),
	status: z.enum(["PENDING", "SUCCESS", "FAILED"]),
	createAt: z.string(),
	item: orderItemSchema.nullable(),
	payment: orderPaymentSchema.nullable(),
	user: orderUserSchema.nullable(),
});

export const getMyOrdersQuerySchema = z.object({
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(10),
});

export const getMyOrdersDataSchema = z.object({
	data: z.array(orderDataSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
});

export const getMyOrdersResponseSchema = z.object({
	data: getMyOrdersDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderPayment = z.infer<typeof orderPaymentSchema>;
export type OrderUser = z.infer<typeof orderUserSchema>;
export type OrderData = z.infer<typeof orderDataSchema>;
export type GetMyOrdersQuery = z.infer<typeof getMyOrdersQuerySchema>;
export type GetMyOrdersData = z.infer<typeof getMyOrdersDataSchema>;
export type GetMyOrdersResponse = z.infer<typeof getMyOrdersResponseSchema>;
