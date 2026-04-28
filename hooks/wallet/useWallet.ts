import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	WalletData,
	getMyWalletResponseSchema,
	CreateWalletRequest,
	CreateWalletResponse,
	createWalletRequestSchema,
	createWalletResponseSchema,
	UpdateWalletRequest,
	UpdateWalletResponse,
	updateWalletRequestSchema,
	updateWalletResponseSchema,
	WithdrawRequest,
	getMyWithdrawRequestsResponseSchema,
	CreateWithdrawRequest,
	CreateWithdrawRequestResponse,
	createWithdrawRequestSchema,
	createWithdrawRequestResponseSchema,
} from "@/validations/wallet/wallet"

export const useGetMyWallet = () => {
	return useQuery<WalletData, AxiosError<ApiError>>({
		queryKey: ["my-wallet"],
		queryFn: async () => {
			const response = await apiClient.get("/community/wallets/me")
			const parsed = getMyWalletResponseSchema.parse(response.data)

			return parsed.data
		},
	})
}

export const useCreateWallet = () => {
	const queryClient = useQueryClient()

	return useMutation<CreateWalletResponse, AxiosError<ApiError>, CreateWalletRequest>({
		mutationFn: async (data) => {
			const payload = createWalletRequestSchema.parse(data)

			const response = await apiClient.post("/community/wallets", payload)

			return createWalletResponseSchema.parse(response.data)
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["my-wallet"] })
		},
	})
}

export const useGetWalletById = (id?: string) => {
	return useQuery<WalletData, AxiosError<ApiError>>({
		queryKey: ["wallet-detail", id],
		enabled: !!id,
		queryFn: async () => {
			const response = await apiClient.get(`/community/wallets/${id}`)
			const parsed = getMyWalletResponseSchema.parse(response.data)

			return parsed.data
		},
	})
}

export const useUpdateWallet = () => {
	const queryClient = useQueryClient()

	return useMutation<UpdateWalletResponse, AxiosError<ApiError>, { id: string; data: UpdateWalletRequest }>(
		{
			mutationFn: async ({ id, data }) => {
				const payload = updateWalletRequestSchema.parse(data)

				const response = await apiClient.put(`/community/wallets/${id}`, payload)

				return updateWalletResponseSchema.parse(response.data)
			},
			onSuccess: async (_response, variables) => {
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ["wallet-detail", variables.id] }),
					queryClient.invalidateQueries({ queryKey: ["my-wallet"] }),
				])
			},
		}
	)
}

export const useGetMyWithdrawRequests = () => {
	return useQuery<WithdrawRequest[], AxiosError<ApiError>>({
		queryKey: ["my-withdraw-requests"],
		queryFn: async () => {
			const response = await apiClient.get("/community/wallets/withdraw-request/me")
			const parsed = getMyWithdrawRequestsResponseSchema.parse(response.data)

			return parsed.data
		},
	})
}

export const useCreateWithdrawRequest = () => {
	const queryClient = useQueryClient()

	return useMutation<
		CreateWithdrawRequestResponse,
		AxiosError<ApiError>,
		CreateWithdrawRequest
	>({
		mutationFn: async (data) => {
			const payload = createWithdrawRequestSchema.parse(data)

			const response = await apiClient.post("/community/wallets/withdraw-request", payload)

			return createWithdrawRequestResponseSchema.parse(response.data)
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["my-withdraw-requests"] }),
				queryClient.invalidateQueries({ queryKey: ["my-wallet"] }),
			])
		},
	})
}
