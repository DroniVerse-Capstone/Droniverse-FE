import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	GetUserCertificatesData,
	GetUserCertificatesParams,
	getUserCertificatesParamsSchema,
	getUserCertificatesResponseSchema,
} from "@/validations/certificate/user-certificate"

export const useGetUserCertificates = (params?: GetUserCertificatesParams) => {
	const parsedParams = getUserCertificatesParamsSchema.parse(params ?? {})

	return useQuery<GetUserCertificatesData, AxiosError<ApiError>>({
		queryKey: ["user-certificates", parsedParams.pageIndex, parsedParams.pageSize],
		queryFn: async () => {
			const response = await apiClient.get("/academy/user/certificates", {
				params: parsedParams,
			})

			const parsed = getUserCertificatesResponseSchema.parse(response.data)

			return parsed.data
		},
	})
}
