import { z } from "zod";

export const notificationStatusSchema = z.enum([
	"PENDING",
	"SENT",
	"FAILED",
	"READ",
]);

export const notificationItemSchema = z.object({
	notificationID: z.string().uuid(),
	title: z.string().trim().min(1),
	message: z.string().trim().min(1),
	type: z.string().trim().min(1),
	status: notificationStatusSchema,
	createdAt: z.string(),
	sentAt: z.string().nullable(),
	errorMessage: z.string().nullable(),
});

export const getNotificationsQuerySchema = z.object({
	status: notificationStatusSchema.optional(),
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(5),
});

export const getNotificationsDataSchema = z.object({
	data: z.array(notificationItemSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
});

export const getNotificationsResponseSchema = z.object({
	data: getNotificationsDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
});

export const getUnreadNotificationCountResponseSchema = z.object({
	success: z.boolean(),
	data: z.number().int().nonnegative(),
	message: z.string(),
});

export const markNotificationAsReadParamsSchema = z.object({
	notificationId: z.string().uuid(),
});

export const markNotificationAsReadResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});

export const markAllNotificationsAsReadResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});

export type NotificationStatus = z.infer<typeof notificationStatusSchema>;
export type NotificationItem = z.infer<typeof notificationItemSchema>;
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
export type GetNotificationsData = z.infer<typeof getNotificationsDataSchema>;
export type GetNotificationsResponse = z.infer<
	typeof getNotificationsResponseSchema
>;
export type GetUnreadNotificationCountResponse = z.infer<
	typeof getUnreadNotificationCountResponseSchema
>;
export type MarkNotificationAsReadParams = z.infer<
	typeof markNotificationAsReadParamsSchema
>;
export type MarkNotificationAsReadResponse = z.infer<
	typeof markNotificationAsReadResponseSchema
>;
export type MarkAllNotificationsAsReadResponse = z.infer<
	typeof markAllNotificationsAsReadResponseSchema
>;
