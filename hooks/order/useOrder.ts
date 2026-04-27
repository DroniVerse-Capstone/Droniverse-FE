import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
	GetMyOrdersData,
	GetMyOrdersQuery,
	getMyOrdersQuerySchema,
	getMyOrdersResponseSchema,
} from "@/validations/order/order";

type UseGetMyOrdersOptions = {
	currentPage?: number;
	pageSize?: number;
};

export const useGetMyOrders = (options?: UseGetMyOrdersOptions) => {
	return useQuery<GetMyOrdersData, AxiosError<ApiError>>({
		queryKey: ["my-orders", options?.currentPage, options?.pageSize],
		queryFn: async () => {
			const parsedQuery: GetMyOrdersQuery = getMyOrdersQuerySchema.parse({
				currentPage: options?.currentPage ?? 1,
				pageSize: options?.pageSize ?? 10,
			});

			const response = await apiClient.get("/community/orders/me", {
				params: parsedQuery,
			});

			const parsed = getMyOrdersResponseSchema.parse(response.data);
			return parsed.data;
		},
	});
};
