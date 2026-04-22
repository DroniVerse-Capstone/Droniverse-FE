import { z } from "zod"

export const clubRevenueOverviewSchema = z.object({
	totalExpense: z.number().nonnegative(),
	expenseThisMonth: z.number().nonnegative(),
	expenseLastMonth: z.number().nonnegative(),
	totalTransactions: z.number().int().nonnegative(),
	transactionsThisMonth: z.number().int().nonnegative(),
})

export const getClubRevenueOverviewParamsSchema = z.object({
	clubId: z.string().uuid(),
})

export const getClubRevenueOverviewResponseSchema = z.object({
	data: clubRevenueOverviewSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const clubExpenseByCourseInfoSchema = z.object({
	courseId: z.string().uuid(),
	courseNameVN: z.string(),
	courseNameEN: z.string(),
	imageUrl: z.string().nullable(),
})

export const clubExpenseByCourseItemSchema = z.object({
	courseInfo: clubExpenseByCourseInfoSchema,
	revenue: z.number().nonnegative(),
})

export const clubExpenseByCourseDataSchema = z.object({
	revenueByCourse: z.array(clubExpenseByCourseItemSchema),
})

export const getClubExpenseByCourseParamsSchema = z.object({
	clubId: z.string().uuid(),
	top: z.number().int().positive().default(10),
})

export const getClubExpenseByCourseResponseSchema = z.object({
	data: clubExpenseByCourseDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const clubExpenseGrowthItemSchema = z.object({
	month: z.string(),
	value: z.number().nonnegative(),
})

export const clubExpenseGrowthDataSchema = z.object({
	revenueGrowth: z.array(clubExpenseGrowthItemSchema),
	totalValue: z.number().nonnegative(),
	growthRate: z.number(),
})

export const getClubExpenseGrowthParamsSchema = z.object({
	clubId: z.string().uuid(),
	months: z.number().int().positive().default(12),
})

export const getClubExpenseGrowthResponseSchema = z.object({
	data: clubExpenseGrowthDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// Admin Revenue Overview

export const adminRevenueOverviewSchema = z.object({
	totalRevenue: z.number().nonnegative(),
	revenueThisMonth: z.number().nonnegative(),
	revenueLastMonth: z.number().nonnegative(),
	revenueGrowthRate: z.number(),
	netProfit: z.number(),
	profitThisMonth: z.number(),
	profitLastMonth: z.number(),
	profitGrowthRate: z.number(),
	totalTransactions: z.number().int().nonnegative(),
	transactionsThisMonth: z.number().int().nonnegative(),
})

export const getAdminRevenueOverviewResponseSchema = z.object({
	data: adminRevenueOverviewSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const adminRevenueGrowthItemSchema = z.object({
	month: z.string(),
	value: z.number().nonnegative(),
})

export const adminRevenueGrowthDataSchema = z.object({
	revenueGrowth: z.array(adminRevenueGrowthItemSchema),
	totalValue: z.number().nonnegative(),
	growthRate: z.number(),
})

export const getAdminRevenueGrowthParamsSchema = z.object({
	months: z.number().int().positive().default(12),
})

export const getAdminRevenueGrowthResponseSchema = z.object({
	data: adminRevenueGrowthDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const adminRevenueByCourseInfoSchema = z.object({
	courseId: z.string().uuid(),
	courseNameVN: z.string(),
	courseNameEN: z.string(),
	imageUrl: z.string().nullable(),
})

export const adminRevenueByCourseItemSchema = z.object({
	courseInfo: adminRevenueByCourseInfoSchema,
	revenue: z.number().nonnegative(),
})

export const adminRevenueByCourseDataSchema = z.object({
	revenueByCourse: z.array(adminRevenueByCourseItemSchema),
})

export const getAdminRevenueByCourseParamsSchema = z.object({
	top: z.number().int().positive().default(10),
})

export const getAdminRevenueByCourseResponseSchema = z.object({
	data: adminRevenueByCourseDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const adminClubRankingCourseSchema = z.object({
	courseId: z.string().uuid(),
	courseNameVN: z.string(),
	courseNameEN: z.string(),
	imageUrl: z.string().nullable(),
})

export const adminClubRankingItemSchema = z.object({
	clubID: z.string().uuid(),
	nameVN: z.string(),
	nameEN: z.string(),
	imageUrl: z.string().nullable(),
	clubCode: z.string(),
	totalSpent: z.number().nonnegative(),
	transactionCount: z.number().int().nonnegative(),
	courses: z.array(adminClubRankingCourseSchema),
})

export const adminClubRankingDataSchema = z.object({
	clubs: z.array(adminClubRankingItemSchema),
})

export const getAdminClubRankingParamsSchema = z.object({
	top: z.number().int().positive().default(10),
})

export const getAdminClubRankingResponseSchema = z.object({
	data: adminClubRankingDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type ClubRevenueOverview = z.infer<typeof clubRevenueOverviewSchema>
export type GetClubRevenueOverviewParams = z.infer<
	typeof getClubRevenueOverviewParamsSchema
>
export type GetClubRevenueOverviewResponse = z.infer<
	typeof getClubRevenueOverviewResponseSchema
>
export type ClubExpenseByCourseInfo = z.infer<
	typeof clubExpenseByCourseInfoSchema
>
export type ClubExpenseByCourseItem = z.infer<
	typeof clubExpenseByCourseItemSchema
>
export type ClubExpenseByCourseData = z.infer<
	typeof clubExpenseByCourseDataSchema
>
export type GetClubExpenseByCourseParams = z.infer<
	typeof getClubExpenseByCourseParamsSchema
>
export type GetClubExpenseByCourseResponse = z.infer<
	typeof getClubExpenseByCourseResponseSchema
>
export type ClubExpenseGrowthItem = z.infer<typeof clubExpenseGrowthItemSchema>
export type ClubExpenseGrowthData = z.infer<typeof clubExpenseGrowthDataSchema>
export type GetClubExpenseGrowthParams = z.infer<
	typeof getClubExpenseGrowthParamsSchema
>
export type GetClubExpenseGrowthResponse = z.infer<
	typeof getClubExpenseGrowthResponseSchema
>
export type AdminRevenueOverview = z.infer<typeof adminRevenueOverviewSchema>
export type GetAdminRevenueOverviewResponse = z.infer<
	typeof getAdminRevenueOverviewResponseSchema
>
export type AdminRevenueGrowthItem = z.infer<typeof adminRevenueGrowthItemSchema>
export type AdminRevenueGrowthData = z.infer<typeof adminRevenueGrowthDataSchema>
export type GetAdminRevenueGrowthParams = z.infer<
	typeof getAdminRevenueGrowthParamsSchema
>
export type GetAdminRevenueGrowthResponse = z.infer<
	typeof getAdminRevenueGrowthResponseSchema
>
export type AdminRevenueByCourseInfo = z.infer<
	typeof adminRevenueByCourseInfoSchema
>
export type AdminRevenueByCourseItem = z.infer<
	typeof adminRevenueByCourseItemSchema
>
export type AdminRevenueByCourseData = z.infer<
	typeof adminRevenueByCourseDataSchema
>
export type GetAdminRevenueByCourseParams = z.infer<
	typeof getAdminRevenueByCourseParamsSchema
>
export type GetAdminRevenueByCourseResponse = z.infer<
	typeof getAdminRevenueByCourseResponseSchema
>
export type AdminClubRankingCourse = z.infer<
	typeof adminClubRankingCourseSchema
>
export type AdminClubRankingItem = z.infer<typeof adminClubRankingItemSchema>
export type AdminClubRankingData = z.infer<typeof adminClubRankingDataSchema>
export type GetAdminClubRankingParams = z.infer<
	typeof getAdminClubRankingParamsSchema
>
export type GetAdminClubRankingResponse = z.infer<
	typeof getAdminClubRankingResponseSchema
>
