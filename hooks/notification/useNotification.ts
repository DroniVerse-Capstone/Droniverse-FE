import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
	GetNotificationsData,
	GetNotificationsQuery,
	MarkAllNotificationsAsReadResponse,
	MarkNotificationAsReadParams,
	MarkNotificationAsReadResponse,
	getNotificationsResponseSchema,
	markAllNotificationsAsReadResponseSchema,
	markNotificationAsReadParamsSchema,
	markNotificationAsReadResponseSchema,
	getUnreadNotificationCountResponseSchema,
	getNotificationsQuerySchema,
} from "@/validations/notification/notification";

type UseGetMyNotificationsOptions = Omit<
	GetNotificationsQuery,
	"currentPage" | "pageSize"
> & {
	currentPage?: number;
	pageSize?: number;
	enabled?: boolean;
};

export const useGetMyNotifications = (
	options?: UseGetMyNotificationsOptions,
) => {
	const parsedOptions = getNotificationsQuerySchema.parse(options ?? {});

	return useQuery<GetNotificationsData, AxiosError<ApiError>>({
		queryKey: [
			"my-notifications",
			parsedOptions.status ?? null,
			parsedOptions.currentPage,
			parsedOptions.pageSize,
		],
		enabled: options?.enabled ?? true,
		queryFn: async () => {
			const response = await apiClient.get("/identity/notitications/me", {
				params: {
					...(parsedOptions.status && { Status: parsedOptions.status }),
					CurrentPage: parsedOptions.currentPage,
					PageSize: parsedOptions.pageSize,
				},
			});

			const parsed = getNotificationsResponseSchema.parse(response.data);
			return parsed.data;
		},
	});
};

type UseGetUnreadNotificationCountOptions = {
	enabled?: boolean;
};

export const useGetUnreadNotificationCount = (
	options?: UseGetUnreadNotificationCountOptions,
) => {
	return useQuery<number, AxiosError<ApiError>>({
		queryKey: ["unread-notification-count"],
		enabled: options?.enabled ?? true,
		queryFn: async () => {
			const response = await apiClient.get(
				"/identity/notitications/unread-count",
			);

			const parsed = getUnreadNotificationCountResponseSchema.parse(
				response.data,
			);
			return parsed.data;
		},
	});
};

type MarkNotificationAsReadVariables = MarkNotificationAsReadParams;

export const useMarkNotificationAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation<
		MarkNotificationAsReadResponse,
		AxiosError<ApiError>,
		MarkNotificationAsReadVariables
	>({
		mutationFn: async ({ notificationId }) => {
			const parsedParams = markNotificationAsReadParamsSchema.parse({
				notificationId,
			});

			const response = await apiClient.put(
				`/identity/notitications/${parsedParams.notificationId}/mark-as-read`,
			);

			return markNotificationAsReadResponseSchema.parse(response.data);
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["my-notifications"] }),
				queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] }),
			]);
		},
	});
};

export const useMarkAllNotificationsAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation<
		MarkAllNotificationsAsReadResponse,
		AxiosError<ApiError>,
		void
	>({
		mutationFn: async () => {
			const response = await apiClient.put(
				"/identity/notitications/mark-all-as-read",
			);

			return markAllNotificationsAsReadResponseSchema.parse(response.data);
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["my-notifications"] }),
				queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] }),
			]);
		},
	});
};

export type { UseGetMyNotificationsOptions };
