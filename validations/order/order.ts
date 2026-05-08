import { z } from "zod";

import { userLevelSchema } from "@/validations/auth";

export const orderClubSchema = z.object({
	clubID: z.string().uuid(),
	nameVN: z.string().trim().min(1),
	nameEN: z.string().trim().min(1),
	imageUrl: z.string().url().nullable(),
});

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
	status: z.enum(["PENDING", "SUCCESS", "FAILED", "CANCELLED"]),
	transactionDate: z.string(),
});

export const orderUserSchema = z.object({
	userId: z.string().uuid(),
	username: z.string().trim().min(1),
	firstName: z.string().trim(),
	lastName: z.string().trim(),
	email: z.string().email(),
	dateOfBirth: z.string().nullable(),
	roleName: z.string().trim(),
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
	status: z.enum(["PENDING", "SUCCESS", "FAILED", "CANCELLED"]),
	createAt: z.string(),
	item: orderItemSchema.nullable(),
	payment: orderPaymentSchema.nullable(),
	user: orderUserSchema.nullable(),
	club: orderClubSchema.nullable().optional(),
});

export const orderOverviewSchema = z.object({
	totalOrders: z.number().int().nonnegative(),
	pendingOrders: z.number().int().nonnegative(),
	successOrders: z.number().int().nonnegative(),
	failedOrders: z.number().int().nonnegative(),
	cancelledOrders: z.number().int().nonnegative(),
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

export const getOrdersQuerySchema = z.object({
	clubId: z.string().uuid().nullable().optional(),
	status: z.enum(["PENDING", "SUCCESS", "FAILED", "CANCELLED"]).nullable().optional(),
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(10),
});

export const getOrdersDataSchema = z.object({
	overview: orderOverviewSchema,
	orders: getMyOrdersDataSchema,
});

export const getOrdersResponseSchema = z.object({
	data: getOrdersDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderPayment = z.infer<typeof orderPaymentSchema>;
export type OrderUser = z.infer<typeof orderUserSchema>;
export type OrderClub = z.infer<typeof orderClubSchema>;
export type OrderData = z.infer<typeof orderDataSchema>;
export type OrderOverview = z.infer<typeof orderOverviewSchema>;
export type GetMyOrdersQuery = z.infer<typeof getMyOrdersQuerySchema>;
export type GetMyOrdersData = z.infer<typeof getMyOrdersDataSchema>;
export type GetMyOrdersResponse = z.infer<typeof getMyOrdersResponseSchema>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type GetOrdersData = z.infer<typeof getOrdersDataSchema>;
export type GetOrdersResponse = z.infer<typeof getOrdersResponseSchema>;
