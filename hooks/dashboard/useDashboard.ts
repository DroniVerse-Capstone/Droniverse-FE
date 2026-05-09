import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	AdminClubRankingData,
	AdminRevenueByCourseData,
	AdminRevenueGrowthData,
	AdminRevenueOverview,
	getAdminClubRankingParamsSchema,
	getAdminClubRankingResponseSchema,
	getAdminRevenueByCourseParamsSchema,
	getAdminRevenueByCourseResponseSchema,
	getAdminRevenueGrowthParamsSchema,
	getAdminRevenueGrowthResponseSchema,
	ClubExpenseByCourseData,
	ClubExpenseGrowthData,
	ClubRevenueOverview,
	getAdminRevenueOverviewResponseSchema,
	getClubExpenseByCourseParamsSchema,
	getClubExpenseByCourseResponseSchema,
	getClubExpenseGrowthParamsSchema,
	getClubExpenseGrowthResponseSchema,
	getClubRevenueOverviewParamsSchema,
	getClubRevenueOverviewResponseSchema,
	getAdminTopBuyersResponseSchema,
	getAdminCompetitionStatsResponseSchema,
	AdminCompetitionStats,
	GetAdminCompetitionStatsParams,
	getAdminCompetitionStatsParamsSchema,
	ClubCompetitionStats,
	ClubCompetitionStatsParams,
	clubCompetitionStatsParamsSchema,
	getClubCompetitionStatsResponseSchema,
	ClubTopBuyersData,
	getClubTopBuyersParamsSchema,
	getClubTopBuyersResponseSchema,
	AdminLearningStatistics,
	getAdminLearningStatisticsResponseSchema,
	AdminOrderStatistics,
	getAdminOrderStatisticsResponseSchema,
	AdminSystemSummary,
	getAdminSystemSummaryParamsSchema,
	getAdminSystemSummaryResponseSchema,
	AdminDetailClubManagersData,
	getAdminDetailClubManagersResponseSchema,
	AdminDetailUsersData,
	getAdminDetailUsersResponseSchema,
	AdminDetailUserOrder,
	getAdminDetailUserOrdersResponseSchema,
	AdminDetailUserTransaction,
	getAdminDetailUserTransactionsResponseSchema,
	AdminDetailCourse,
	AdminDetailCoursesData,
	getAdminDetailCoursesResponseSchema,
	AdminDetailCourseClub,
	AdminDetailCourseClubsData,
	getAdminDetailCourseClubsResponseSchema,
	CourseFeedback,
	getCourseFeedbacksResponseSchema,
	AdminDetailClubOverview,
	AdminDetailClubsOverviewData,
	getAdminDetailClubsOverviewResponseSchema,
	AdminClubTransaction,
	AdminClubTransactionsData,
	getAdminDetailClubTransactionsResponseSchema,
} from "@/validations/dashboard/dashboard"

export const useGetClubRevenueOverview = (clubId?: string) => {
	return useQuery<ClubRevenueOverview, AxiosError<ApiError>>({
		queryKey: ["club-revenue-overview", clubId],
		enabled: !!clubId,
		queryFn: async () => {
			const parsedParams = getClubRevenueOverviewParamsSchema.parse({
				clubId,
			})

			const response = await apiClient.get(
				`/community/dashboards/revenue/clubs/${parsedParams.clubId}/overview`
			)

			const parsed = getClubRevenueOverviewResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetAdminRevenueOverview = () => {
	return useQuery<AdminRevenueOverview, AxiosError<ApiError>>({
		queryKey: ["admin-revenue-overview"],
		queryFn: async () => {
			const response = await apiClient.get(
				"/community/dashboards/revenue/admin/overview"
			)

			const parsed = getAdminRevenueOverviewResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

type UseGetAdminRevenueGrowthOptions = {
	months?: number
	fromDate?: string
	toDate?: string
}

export const useGetAdminRevenueGrowth = (
	options?: UseGetAdminRevenueGrowthOptions
) => {
	return useQuery<AdminRevenueGrowthData, AxiosError<ApiError>>({
		queryKey: ["admin-revenue-growth", options?.months, options?.fromDate, options?.toDate],
		queryFn: async () => {
			const parsedParams = getAdminRevenueGrowthParamsSchema.parse({
				months: options?.months,
				fromDate: options?.fromDate,
				toDate: options?.toDate,
			})

			const response = await apiClient.get(
				"/community/dashboards/revenue/admin/growth",
				{
					params: parsedParams,
				}
			)

			const parsed = getAdminRevenueGrowthResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

type UseGetAdminRevenueByCourseOptions = {
	top?: number
}

export const useGetAdminRevenueByCourse = (
	options?: UseGetAdminRevenueByCourseOptions
) => {
	return useQuery<AdminRevenueByCourseData, AxiosError<ApiError>>({
		queryKey: ["admin-revenue-by-course", options?.top],
		queryFn: async () => {
			const parsedParams = getAdminRevenueByCourseParamsSchema.parse({
				top: options?.top,
			})

			const response = await apiClient.get(
				"/community/dashboards/revenue/admin/by-course",
				{
					params: {
						top: parsedParams.top,
					},
				}
			)

			const parsed = getAdminRevenueByCourseResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

type UseGetAdminClubRankingOptions = {
	top?: number
}

export const useGetAdminClubRanking = (
	options?: UseGetAdminClubRankingOptions
) => {
	return useQuery<AdminClubRankingData, AxiosError<ApiError>>({
		queryKey: ["admin-club-ranking", options?.top],
		queryFn: async () => {
			const parsedParams = getAdminClubRankingParamsSchema.parse({
				top: options?.top,
			})

			const response = await apiClient.get(
				"/community/dashboards/revenue/admin/club-ranking",
				{
					params: {
						top: parsedParams.top,
					},
				}
			)

			const parsed = getAdminClubRankingResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetAdminTopBuyers = (top: number = 10) => {
	return useQuery<{ buyers: any[]; totalSystemRevenue: number }, AxiosError<ApiError>>({
		queryKey: ["admin-top-buyers", top],
		queryFn: async () => {
			const response = await apiClient.get("/community/dashboards/buyers/admin/top", {
				params: { top },
			})
			const parsed = getAdminTopBuyersResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetAdminCompetitionStats = (params?: GetAdminCompetitionStatsParams) => {
	return useQuery<AdminCompetitionStats, AxiosError<ApiError>>({
		queryKey: ["admin-competition-stats", params],
		queryFn: async () => {
			const parsedParams = getAdminCompetitionStatsParamsSchema.parse(params || { top: 10 })
			const response = await apiClient.get("/community/dashboards/competitions/admin/stats", {
				params: parsedParams,
			})
			const parsed = getAdminCompetitionStatsResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

type UseGetClubExpenseByCourseOptions = {
	top?: number
}

export const useGetClubExpenseByCourse = (
	clubId?: string,
	options?: UseGetClubExpenseByCourseOptions
) => {
	return useQuery<ClubExpenseByCourseData, AxiosError<ApiError>>({
		queryKey: ["club-expense-by-course", clubId, options?.top],
		enabled: !!clubId,
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const parsedParams = getClubExpenseByCourseParamsSchema.parse({
				clubId,
				top: options?.top,
			})

			const response = await apiClient.get(
				`/community/dashboards/expense/clubs/${parsedParams.clubId}/by-course`,
				{
					params: {
						top: parsedParams.top,
					},
				}
			)

			const parsed = getClubExpenseByCourseResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

type UseGetClubExpenseGrowthOptions = {
	months?: number
	fromDate?: string
	toDate?: string
}

export const useGetClubExpenseGrowth = (
	clubId?: string,
	options?: UseGetClubExpenseGrowthOptions
) => {
	return useQuery<ClubExpenseGrowthData, AxiosError<ApiError>>({
		queryKey: ["club-expense-growth", clubId, options?.months, options?.fromDate, options?.toDate],
		enabled: !!clubId,
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const parsedParams = getClubExpenseGrowthParamsSchema.parse({
				clubId,
				months: options?.months,
				fromDate: options?.fromDate,
				toDate: options?.toDate,
			})

			const response = await apiClient.get(
				`/community/dashboards/expense/clubs/${parsedParams.clubId}/growth`,
				{
					params: {
						months: parsedParams.months,
						fromDate: parsedParams.fromDate,
						toDate: parsedParams.toDate,
					},
				}
			)

			const parsed = getClubExpenseGrowthResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export type { UseGetClubExpenseByCourseOptions }
export type { UseGetClubExpenseGrowthOptions }
export type { UseGetAdminRevenueGrowthOptions }
export type { UseGetAdminRevenueByCourseOptions }
export type { UseGetAdminClubRankingOptions }

export const useGetClubCompetitionStats = (clubId?: string, params?: Omit<ClubCompetitionStatsParams, "clubId">) => {
	return useQuery<ClubCompetitionStats, AxiosError<ApiError>>({
		queryKey: ["club-competition-stats", clubId, params],
		enabled: !!clubId,
		queryFn: async () => {
			const parsedParams = clubCompetitionStatsParamsSchema.parse({ ...params, clubId })
			const { clubId: _, ...queryParams } = parsedParams
			const response = await apiClient.get(
				`/community/dashboards/competitions/clubs/${parsedParams.clubId}/stats`,
				{ params: queryParams }
			)
			const parsed = getClubCompetitionStatsResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetClubTopBuyers = (clubId?: string, top: number = 10) => {
	return useQuery<ClubTopBuyersData, AxiosError<ApiError>>({
		queryKey: ["club-top-buyers", clubId, top],
		enabled: !!clubId,
		queryFn: async () => {
			const parsedParams = getClubTopBuyersParamsSchema.parse({ clubId, top })
			const response = await apiClient.get(
				`/community/dashboards/buyers/clubs/${parsedParams.clubId}/top`,
				{ params: { top: parsedParams.top } }
			)
			const parsed = getClubTopBuyersResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetAdminLearningStatistics = () => {
	return useQuery<AdminLearningStatistics, AxiosError<ApiError>>({
		queryKey: ["admin-learning-statistics"],
		queryFn: async () => {
			const response = await apiClient.get(
				"/academy/system/learning-statistics"
			)
			const parsed = getAdminLearningStatisticsResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export type AdminOrderStatisticsParams = {
	currentPage?: number
	pageSize?: number
	clubId?: string
	buyerId?: string
	status?: string
	type?: string
	createAt?: string
	receiveDate?: string
}

export const useGetAdminOrderStatistics = (params?: AdminOrderStatisticsParams) => {
	return useQuery<AdminOrderStatistics, AxiosError<ApiError>>({
		queryKey: ["admin-order-statistics", params],
		queryFn: async () => {
			// Build clean params - omit undefined/empty values
			const cleanParams: Record<string, any> = {}
			if (params?.currentPage) cleanParams.currentPage = params.currentPage
			if (params?.pageSize) cleanParams.pageSize = params.pageSize
			if (params?.clubId) cleanParams.clubId = params.clubId
			if (params?.buyerId) cleanParams.buyerId = params.buyerId
			if (params?.status) cleanParams.status = params.status
			if (params?.type) cleanParams.type = params.type
			if (params?.createAt) cleanParams.createAt = params.createAt
			if (params?.receiveDate) cleanParams.receiveDate = params.receiveDate

			const response = await apiClient.get(
				"/community/dashboards/system/orders",
				{ params: cleanParams }
			)
			const parsed = getAdminOrderStatisticsResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetAdminSystemSummary = (identityFilterTimeLine?: string) => {
	return useQuery<AdminSystemSummary, AxiosError<ApiError>>({
		queryKey: ["admin-system-summary", identityFilterTimeLine],
		queryFn: async () => {
			const parsedParams = getAdminSystemSummaryParamsSchema.parse({
				identityFilterTimeLine,
			})

			const response = await apiClient.get("/community/dashboards/system/summary", {
				params: parsedParams,
			})

			const parsed = getAdminSystemSummaryResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetAdminDetailClubManagers = (params: { pageIndex: number, pageSize: number }) => {
	return useQuery<AdminDetailClubManagersData, AxiosError<ApiError>>({
		queryKey: ["admin-detail-club-managers", params],
		queryFn: async () => {
			const response = await apiClient.get("/community/detail-dashboards/club-managers", {
				params: {
					page: params.pageIndex,
					pageSize: params.pageSize,
				}
			})
			const parsed = getAdminDetailClubManagersResponseSchema.parse(response.data)
			return parsed.data
		}
	})
}

export const useGetAdminDetailUsers = (params: { pageIndex: number, pageSize: number }) => {
	return useQuery<AdminDetailUsersData, AxiosError<ApiError>>({
		queryKey: ["admin-detail-users", params],
		queryFn: async () => {
			const response = await apiClient.get("/community/detail-dashboards/users", {
				params: {
					page: params.pageIndex,
					pageSize: params.pageSize,
				}
			})
			const parsed = getAdminDetailUsersResponseSchema.parse(response.data)
			return parsed.data
		}
	})
}

export const useGetAdminDetailUserOrders = (userId?: string) => {
	return useQuery<AdminDetailUserOrder[], AxiosError<ApiError>>({
		queryKey: ["admin-detail-user-orders", userId],
		enabled: !!userId,
		queryFn: async () => {
			const response = await apiClient.get(`/community/detail-dashboards/users/${userId}/orders`)
			const parsed = getAdminDetailUserOrdersResponseSchema.parse(response.data)
			return parsed.data
		}
	})
}

export const useGetAdminDetailUserTransactions = (userId?: string) => {
	return useQuery<AdminDetailUserTransaction[], AxiosError<ApiError>>({
		queryKey: ["admin-detail-user-transactions", userId],
		enabled: !!userId,
		queryFn: async () => {
			const response = await apiClient.get(`/community/detail-dashboards/users/${userId}/transactions`)
			const parsed = getAdminDetailUserTransactionsResponseSchema.parse(response.data)
			return parsed.data
		}
	})
}

export const useGetAdminDetailCourses = (params: { pageIndex: number, pageSize: number }) => {
	return useQuery<AdminDetailCoursesData, AxiosError<ApiError>>({
		queryKey: ["admin-detail-courses", params],
		queryFn: async () => {
			const response = await apiClient.get("/community/detail-dashboards/courses", {
				params: {
					page: params.pageIndex,
					pageSize: params.pageSize,
				}
			})
			const parsed = getAdminDetailCoursesResponseSchema.parse(response.data)
			return parsed.data
		}
	})
}

export const useGetAdminDetailCourseClubs = (
	courseId: string | null,
	params: { pageIndex: number; pageSize: number }
) => {
	return useQuery<AdminDetailCourseClubsData, AxiosError<ApiError>>({
		queryKey: ["admin-detail-course-clubs", courseId, params],
		queryFn: async () => {
			const response = await apiClient.get(
				`/community/detail-dashboards/courses/${courseId}/clubs`,
				{
					params: {
						page: params.pageIndex,
						pageSize: params.pageSize,
					}
				}
			)
			const parsed = getAdminDetailCourseClubsResponseSchema.parse(response.data)
			return parsed.data
		},
		enabled: !!courseId,
	})
}

export const useGetCourseFeedbacks = (courseId: string | null) => {
	return useQuery<CourseFeedback[], AxiosError<ApiError>>({
		queryKey: ["course-feedbacks", courseId],
		queryFn: async () => {
			const response = await apiClient.get(`/academy/feedbacks/courses/${courseId}`)
			const parsed = getCourseFeedbacksResponseSchema.parse(response.data)
			return parsed.data
		},
		enabled: !!courseId,
	})
}

export const useGetAdminDetailClubsOverview = (params: { pageIndex: number; pageSize: number }) => {
	return useQuery<AdminDetailClubsOverviewData, AxiosError<ApiError>>({
		queryKey: ["admin-detail-clubs-overview", params],
		queryFn: async () => {
			const response = await apiClient.get("/community/detail-dashboards/clubs", {
				params: {
					page: params.pageIndex,
					pageSize: params.pageSize,
				}
			})
			const parsed = getAdminDetailClubsOverviewResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}

export const useGetAdminDetailClubTransactions = (clubId: string, params: { page: number; pageSize: number; courseId?: string }) => {
	return useQuery<AdminClubTransactionsData, AxiosError<ApiError>>({
		queryKey: ["admin-detail-club-transactions", clubId, params],
		queryFn: async () => {
			const response = await apiClient.get(`/community/detail-dashboards/clubs/${clubId}/transactions`, { params })
			const parsed = getAdminDetailClubTransactionsResponseSchema.parse(response.data)
			return parsed.data
		},
		enabled: !!clubId,
	})
}

