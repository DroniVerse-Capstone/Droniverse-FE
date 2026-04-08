import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	CreatePaymentOrderRequest,
	CreatePaymentOrderResponse,
	PaymentDetailData,
	createPaymentOrderRequestSchema,
	createPaymentOrderResponseSchema,
	getPaymentDetailQuerySchema,
	getPaymentDetailResponseSchema,
} from "@/validations/payment/payment"


export const useCreatePaymentOrder = () => {
	return useMutation<
		CreatePaymentOrderResponse,
		AxiosError<ApiError>,
		CreatePaymentOrderRequest
	>({
		mutationFn: async (data) => {
			const payload = createPaymentOrderRequestSchema.parse(data)

			const response = await apiClient.post("/community/orders", payload)

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
