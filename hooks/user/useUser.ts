import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
	GetUsersData,
	GetUsersQuery,
	getUsersQuerySchema,
	getUsersResponseSchema,
} from "@/validations/user/user";

type UseGetUsersOptions = Omit<GetUsersQuery, "currentPage" | "pageSize"> & {
	currentPage?: number;
	pageSize?: number;
};

export const useGetUsers = (options?: UseGetUsersOptions) => {
	const parsedOptions = getUsersQuerySchema.parse(options ?? {});

	return useQuery<GetUsersData, AxiosError<ApiError>>({
		queryKey: [
			"users",
			parsedOptions.username ?? null,
			parsedOptions.email ?? null,
			parsedOptions.roleName ?? null,
			parsedOptions.sortDirection ?? null,
			parsedOptions.currentPage,
			parsedOptions.pageSize,
		],
		queryFn: async () => {
			const response = await apiClient.get("/identity/users", {
				params: {
					...(parsedOptions.username && { Username: parsedOptions.username }),
					...(parsedOptions.email && { Email: parsedOptions.email }),
					...(parsedOptions.roleName && { roleName: parsedOptions.roleName }),
					...(parsedOptions.sortDirection && {
						SortDirection: parsedOptions.sortDirection,
					}),
					CurrentPage: parsedOptions.currentPage,
					PageSize: parsedOptions.pageSize,
				},
			});

			const parsed = getUsersResponseSchema.parse(response.data);
			return parsed;
		},
	});
};

export type { UseGetUsersOptions };
