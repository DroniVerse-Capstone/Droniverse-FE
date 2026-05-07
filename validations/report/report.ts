import { z } from "zod";

export const reportTypeSchema = z.enum(["CourseVersion", "Club", "User"]);

export const reportUserSchema = z.object({
	userId: z.string().uuid(),
	fullName: z.string(),
	email: z.string().email(),
	avatarUrl: z.string().url().nullable(),
});

export const reportSchema = z.object({
	reportID: z.string().uuid(),
	reportType: reportTypeSchema,
	referenceID: z.string().uuid(),
	userID: z.string().uuid(),
	user: reportUserSchema,
	contentVN: z.string(),
	contentEN: z.string(),
	responseVN: z.string().nullable(),
	responseEN: z.string().nullable(),
	responser: z.string().uuid().nullable(),
	responserUser: reportUserSchema.nullable(),
});

export const getReportsQuerySchema = z.object({
	pageIndex: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(10),
	reportType: reportTypeSchema.optional(),
});

export const getReportsDataSchema = z.object({
	data: z.array(reportSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
});

export const getReportsResponseSchema = z.object({
	data: getReportsDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
});

export const getMyReportsQuerySchema = getReportsQuerySchema;

export const getMyReportsDataSchema = getReportsDataSchema;

export const getMyReportsResponseSchema = getReportsResponseSchema;

export const respondReportRequestSchema = z.object({
	responseVN: z.string().trim().min(1),
	responseEN: z.string().trim().min(1),
});

export const respondReportResponseSchema = z.object({
	data: reportSchema,
	isSuccess: z.boolean(),
	message: z.string(),
});

export const createReportRequestSchema = z.object({
	referenceID: z.string().uuid(),
	reportType: reportTypeSchema,
	contentVN: z.string().trim().min(1),
	contentEN: z.string().trim().min(1),
});

export const createReportResponseSchema = z.object({
	data: reportSchema,
	isSuccess: z.boolean(),
	message: z.string(),
});

export type ReportType = z.infer<typeof reportTypeSchema>;
export type ReportUser = z.infer<typeof reportUserSchema>;
export type Report = z.infer<typeof reportSchema>;
export type GetReportsQuery = z.infer<typeof getReportsQuerySchema>;
export type GetReportsData = z.infer<typeof getReportsDataSchema>;
export type GetReportsResponse = z.infer<typeof getReportsResponseSchema>;
export type GetMyReportsQuery = z.infer<typeof getMyReportsQuerySchema>;
export type GetMyReportsData = z.infer<typeof getMyReportsDataSchema>;
export type GetMyReportsResponse = z.infer<typeof getMyReportsResponseSchema>;
export type RespondReportRequest = z.infer<typeof respondReportRequestSchema>;
export type RespondReportResponse = z.infer<typeof respondReportResponseSchema>;
export type CreateReportRequest = z.infer<typeof createReportRequestSchema>;
export type CreateReportResponse = z.infer<typeof createReportResponseSchema>;
