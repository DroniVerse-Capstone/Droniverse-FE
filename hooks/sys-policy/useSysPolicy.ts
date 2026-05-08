import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
	GetSystemPoliciesData,
	GetSystemPoliciesQuery,
	getSystemPoliciesQuerySchema,
	getSystemPoliciesResponseSchema,
} from "@/validations/sys-policy/sys-policy";

type UseGetSystemPoliciesOptions = Omit<
	GetSystemPoliciesQuery,
	"currentPage" | "pageSize"
> & {
	currentPage?: number;
	pageSize?: number;
};

export const useGetSystemPolicies = (
	options?: UseGetSystemPoliciesOptions,
) => {
	const parsedOptions = getSystemPoliciesQuerySchema.parse(options ?? {});

	return useQuery<GetSystemPoliciesData, AxiosError<ApiError>>({
		queryKey: [
			"system-policies",
			parsedOptions.currentPage,
			parsedOptions.pageSize,
		],
		queryFn: async () => {
			const response = await apiClient.get("/identity/system-policies", {
				params: {
					CurrentPage: parsedOptions.currentPage,
					PageSize: parsedOptions.pageSize,
				},
			});

			const parsed = getSystemPoliciesResponseSchema.parse(response.data);
			return parsed;
		},
	});
};

export type { UseGetSystemPoliciesOptions };
