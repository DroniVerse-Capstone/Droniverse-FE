import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	GetCommissionTransactionsData,
	GetCommissionTransactionsParams,
	getCommissionTransactionsParamsSchema,
	getCommissionTransactionsResponseSchema,
} from "@/validations/transaction/transaction"

export const useGetMyCommissionTransactions = (params?: GetCommissionTransactionsParams) => {
	const parsedParams = getCommissionTransactionsParamsSchema.parse(params ?? {})

	return useQuery<GetCommissionTransactionsData, AxiosError<ApiError>>({
		queryKey: ["my-commission-transactions", parsedParams.currentPage, parsedParams.pageSize, parsedParams.type],
		queryFn: async () => {
			const response = await apiClient.get("/community/transactions/me", {
				params: parsedParams,
			})
			
			const parsed = getCommissionTransactionsResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}
