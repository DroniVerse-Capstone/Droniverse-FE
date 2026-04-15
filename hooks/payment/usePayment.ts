import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CreateClubPaymentOrderParams,
	CreatePaymentOrderRequest,
	CreatePaymentOrderResponse,
	PaymentDetailData,
	createClubPaymentOrderParamsSchema,
	createPaymentOrderRequestSchema,
	createPaymentOrderResponseSchema,
	getPaymentDetailQuerySchema,
	getPaymentDetailResponseSchema,
} from "@/validations/payment/payment"

type CreatePaymentOrderVariables = CreateClubPaymentOrderParams & {
	data: CreatePaymentOrderRequest
}


export const useCreatePaymentOrder = () => {
	return useMutation<
		CreatePaymentOrderResponse,
		AxiosError<ApiError>,
		CreatePaymentOrderVariables
	>({
		mutationFn: async ({ clubId, data }) => {
			const parsedParams = createClubPaymentOrderParamsSchema.parse({ clubId })
			const payload = createPaymentOrderRequestSchema.parse(data)

			const response = await apiClient.post(
				`/community/orders/clubs/${parsedParams.clubId}`,
				payload
			)

			return createPaymentOrderResponseSchema.parse(response.data)
		},
	})
}

export const useGetPaymentDetail = (orderId?: string) => {
	return useQuery<PaymentDetailData, AxiosError<ApiError>>({
		queryKey: ["payment-detail", orderId],
		enabled: !!orderId,
		queryFn: async () => {
			const parsedQuery = getPaymentDetailQuerySchema.parse({ orderId })

			const response = await apiClient.get(
				`/community/payments/${parsedQuery.orderId}`
			)

			const parsed = getPaymentDetailResponseSchema.parse(response.data)
			return parsed.data
		},
	})
}
