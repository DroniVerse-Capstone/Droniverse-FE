import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
	GetMyOrdersData,
	GetMyOrdersQuery,
	GetOrdersData,
	GetOrdersQuery,
	getMyOrdersQuerySchema,
	getMyOrdersResponseSchema,
	getOrdersQuerySchema,
	getOrdersResponseSchema,
} from "@/validations/order/order";

type UseGetMyOrdersOptions = {
	currentPage?: number;
	pageSize?: number;
};

type UseGetOrdersOptions = Omit<GetOrdersQuery, "currentPage" | "pageSize"> & {
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

export const useGetOrders = (options?: UseGetOrdersOptions) => {
	return useQuery<GetOrdersData, AxiosError<ApiError>>({
		queryKey: [
			"orders",
			options?.clubId,
			options?.status,
			options?.currentPage,
			options?.pageSize,
		],
		queryFn: async () => {
			const parsedQuery: GetOrdersQuery = getOrdersQuerySchema.parse({
				clubId: options?.clubId,
				status: options?.status,
				currentPage: options?.currentPage ?? 1,
				pageSize: options?.pageSize ?? 10,
			});

			const response = await apiClient.get("/community/orders", {
				params: {
					...(parsedQuery.clubId && { ClubId: parsedQuery.clubId }),
					...(parsedQuery.status && { Status: parsedQuery.status }),
					CurrentPage: parsedQuery.currentPage,
					PageSize: parsedQuery.pageSize,
				},
			});

			const parsed = getOrdersResponseSchema.parse(response.data);
			return parsed.data;
		},
	});
};
