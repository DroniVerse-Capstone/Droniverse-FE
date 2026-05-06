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
	totalRevenue: z.number().nonnegative().optional(),
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

// --- PHASE 3: BUYERS & COMPETITIONS ---

export const adminTopBuyerSchema = z.object({
	userId: z.string().uuid(),
	userName: z.string(),
	email: z.string(),
	imageUrl: z.string().nullable(),
	totalSpent: z.number().nonnegative(),
	purchaseCount: z.number().int().nonnegative(),
})

export const getAdminTopBuyersResponseSchema = z.object({
	data: z.object({
		buyers: z.array(adminTopBuyerSchema),
		totalSystemRevenue: z.number().nonnegative(),
	}),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const adminCompetitionStatsOverviewSchema = z.object({
	totalCompetitions: z.number().int().nonnegative(),
	publishedCompetitions: z.number().int().nonnegative(),
	completedCompetitions: z.number().int().nonnegative(),
	cancelledCompetitions: z.number().int().nonnegative(),
	draftCompetitions: z.number().int().nonnegative(),
	invalidCompetitions: z.number().int().nonnegative(),
	totalParticipants: z.number().int().nonnegative(),
	averageParticipantsPerCompetition: z.number(),
})

export const adminCompetitionTopItemSchema = z.object({
	competitionId: z.string().uuid(),
	nameVN: z.string(),
	nameEN: z.string(),
	competitionStatus: z.string(),
	competitionPhase: z.string().nullable(),
	clubId: z.string().uuid(),
	clubNameVN: z.string(),
	participantCount: z.number().int().nonnegative(),
	startDate: z.string(),
	endDate: z.string(),
})

export const adminCompetitionStatsSchema = z.object({
	overview: adminCompetitionStatsOverviewSchema,
	topByParticipants: z.array(adminCompetitionTopItemSchema),
})

export const getAdminCompetitionStatsParamsSchema = z.object({
	top: z.number().int().positive().default(10),
	competitionStatus: z.string().optional().nullable(),
	competitionPhase: z.string().optional().nullable(),
	clubId: z.string().uuid().optional().nullable(),
	startDateFrom: z.string().datetime().optional().nullable(),
	startDateTo: z.string().datetime().optional().nullable(),
	endDateFrom: z.string().datetime().optional().nullable(),
	endDateTo: z.string().datetime().optional().nullable(),
	createdBy: z.string().uuid().optional().nullable(),
	updatedBy: z.string().uuid().optional().nullable(),
	minTotalRounds: z.number().int().nonnegative().optional().nullable(),
	maxTotalRounds: z.number().int().nonnegative().optional().nullable(),
	minTotalPrizes: z.number().int().nonnegative().optional().nullable(),
	maxTotalPrizes: z.number().int().nonnegative().optional().nullable(),
	minTotalCompetitors: z.number().int().nonnegative().optional().nullable(),
	maxTotalCompetitors: z.number().int().nonnegative().optional().nullable(),
})

export const getAdminCompetitionStatsResponseSchema = z.object({
	data: adminCompetitionStatsSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type AdminTopBuyer = z.infer<typeof adminTopBuyerSchema>
export type GetAdminTopBuyersResponse = z.infer<typeof getAdminTopBuyersResponseSchema>
export type AdminCompetitionStats = z.infer<typeof adminCompetitionStatsSchema>
export type GetAdminCompetitionStatsResponse = z.infer<typeof getAdminCompetitionStatsResponseSchema>
export type GetAdminCompetitionStatsParams = z.infer<typeof getAdminCompetitionStatsParamsSchema>

// --- CLUB COMPETITION STATS ---
export const clubCompetitionStatsParamsSchema = z.object({
	clubId: z.string().uuid(),
	top: z.number().int().positive().default(10),
	competitionStatus: z.string().optional().nullable(),
	competitionPhase: z.string().optional().nullable(),
	startDateFrom: z.string().datetime().optional().nullable(),
	startDateTo: z.string().datetime().optional().nullable(),
	endDateFrom: z.string().datetime().optional().nullable(),
	endDateTo: z.string().datetime().optional().nullable(),
	createdBy: z.string().uuid().optional().nullable(),
	updatedBy: z.string().uuid().optional().nullable(),
	minTotalRounds: z.number().int().nonnegative().optional().nullable(),
	maxTotalRounds: z.number().int().nonnegative().optional().nullable(),
	minTotalPrizes: z.number().int().nonnegative().optional().nullable(),
	maxTotalPrizes: z.number().int().nonnegative().optional().nullable(),
	minTotalCompetitors: z.number().int().nonnegative().optional().nullable(),
	maxTotalCompetitors: z.number().int().nonnegative().optional().nullable(),
})

export type ClubCompetitionStatsParams = z.infer<typeof clubCompetitionStatsParamsSchema>

// Reuse overview + topItem shapes (identical structure to admin)
export const clubCompetitionStatsSchema = adminCompetitionStatsSchema

export const getClubCompetitionStatsResponseSchema = z.object({
	data: clubCompetitionStatsSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type ClubCompetitionStats = z.infer<typeof clubCompetitionStatsSchema>
export type GetClubCompetitionStatsResponse = z.infer<typeof getClubCompetitionStatsResponseSchema>

// --- CLUB TOP BUYERS ---
export const getClubTopBuyersParamsSchema = z.object({
	clubId: z.string().uuid(),
	top: z.number().int().positive().default(10),
})

export const getClubTopBuyersResponseSchema = z.object({
	data: z.object({
		buyers: z.array(adminTopBuyerSchema),
		totalSystemRevenue: z.number().nonnegative(),
	}),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type ClubTopBuyersData = z.infer<typeof getClubTopBuyersResponseSchema>["data"]

// --- LEARNING STATISTICS ---
export const adminLearningSummarySchema = z.object({
	totalEnrollments: z.number().int().nonnegative(),
	avgGlobalProgress: z.number(),
	totalCertificates: z.number().int().nonnegative(),
	activeLearners30Days: z.number().int().nonnegative(),
})

export const adminTopClubLearningSchema = z.object({
	clubName: z.string(),
	clubImageUrl: z.string().nullable(),
	avgProgress: z.number(),
	membersCount: z.number().int().nonnegative(),
	clubId: z.string().uuid(),
})

export const adminCourseLearningStatSchema = z.object({
	courseName: z.string(),
	enrollments: z.number().int().nonnegative(),
	completionRate: z.number(),
	courseId: z.string().uuid(),
})

export const adminWeeklyActivityItemSchema = z.object({
	date: z.string(),
	lessonsCompleted: z.number().int().nonnegative(),
})

export const adminLearningStatisticsSchema = z.object({
	summary: adminLearningSummarySchema,
	topClubs: z.array(adminTopClubLearningSchema),
	courseStats: z.array(adminCourseLearningStatSchema),
	weeklyActivity: z.array(adminWeeklyActivityItemSchema),
})

export const getAdminLearningStatisticsResponseSchema = z.object({
	data: adminLearningStatisticsSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type AdminLearningStatistics = z.infer<typeof adminLearningStatisticsSchema>
export type GetAdminLearningStatisticsResponse = z.infer<typeof getAdminLearningStatisticsResponseSchema>
