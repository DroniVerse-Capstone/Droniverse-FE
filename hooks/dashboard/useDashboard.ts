import { useQuery } from "@tanstack/react-query"
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
}

export const useGetAdminRevenueGrowth = (
	options?: UseGetAdminRevenueGrowthOptions
) => {
	return useQuery<AdminRevenueGrowthData, AxiosError<ApiError>>({
		queryKey: ["admin-revenue-growth", options?.months],
		queryFn: async () => {
			const parsedParams = getAdminRevenueGrowthParamsSchema.parse({
				months: options?.months,
			})

			const response = await apiClient.get(
				"/community/dashboards/revenue/admin/growth",
				{
					params: {
						months: parsedParams.months,
					},
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
}

export const useGetClubExpenseGrowth = (
	clubId?: string,
	options?: UseGetClubExpenseGrowthOptions
) => {
	return useQuery<ClubExpenseGrowthData, AxiosError<ApiError>>({
		queryKey: ["club-expense-growth", clubId, options?.months],
		enabled: !!clubId,
		queryFn: async () => {
			const parsedParams = getClubExpenseGrowthParamsSchema.parse({
				clubId,
				months: options?.months,
			})

			const response = await apiClient.get(
				`/community/dashboards/expense/clubs/${parsedParams.clubId}/growth`,
				{
					params: {
						months: parsedParams.months,
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
