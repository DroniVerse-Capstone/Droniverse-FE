import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
	CreateReportRequest,
	CreateReportResponse,
	GetReportsData,
	GetReportsQuery,
	GetMyReportsData,
	GetMyReportsQuery,
	RespondReportRequest,
	RespondReportResponse,
	getReportsQuerySchema,
	getReportsResponseSchema,
	getMyReportsQuerySchema,
	getMyReportsResponseSchema,
	createReportRequestSchema,
	createReportResponseSchema,
	respondReportRequestSchema,
	respondReportResponseSchema,
} from "@/validations/report/report";

type UseGetReportsOptions = Partial<GetReportsQuery> & {
	enabled?: boolean;
};

export const useGetReports = (options?: UseGetReportsOptions) => {
	const query = getReportsQuerySchema.parse({
		pageIndex: options?.pageIndex,
		pageSize: options?.pageSize,
		reportType: options?.reportType,
	});

	return useQuery<GetReportsData, AxiosError<ApiError>>({
		queryKey: ["reports", query.pageIndex, query.pageSize, query.reportType],
		enabled: options?.enabled ?? true,
		queryFn: async () => {
			const response = await apiClient.get("/academy/admin/reports", {
				params: {
					pageIndex: query.pageIndex,
					pageSize: query.pageSize,
					...(query.reportType && { reportType: query.reportType }),
				},
			});

			const parsed = getReportsResponseSchema.parse(response.data);
			return parsed.data;
		},
	});
};

type UseGetMyReportsOptions = Partial<GetMyReportsQuery> & {
	enabled?: boolean;
};

export const useGetMyReports = (options?: UseGetMyReportsOptions) => {
	const query = getMyReportsQuerySchema.parse({
		pageIndex: options?.pageIndex,
		pageSize: options?.pageSize,
		reportType: options?.reportType,
	});

	return useQuery<GetMyReportsData, AxiosError<ApiError>>({
		queryKey: ["my-reports", query.pageIndex, query.pageSize, query.reportType],
		enabled: options?.enabled ?? true,
		queryFn: async () => {
			const response = await apiClient.get("/academy/reports/my", {
				params: {
					pageIndex: query.pageIndex,
					pageSize: query.pageSize,
					...(query.reportType && { reportType: query.reportType }),
				},
			});

			const parsed = getMyReportsResponseSchema.parse(response.data);
			return parsed.data;
		},
	});
};

export const useCreateReport = () => {
	const queryClient = useQueryClient();

	return useMutation<CreateReportResponse, AxiosError<ApiError>, CreateReportRequest>({
		mutationFn: async (payload) => {
			const requestBody = createReportRequestSchema.parse(payload);
			const response = await apiClient.post("/academy/reports", requestBody);

			return createReportResponseSchema.parse(response.data);
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["my-reports"] }),
				queryClient.invalidateQueries({ queryKey: ["reports"] }),
			]);
		},
	});
};

type UseRespondReportVariables = {
	reportId: string;
	payload: RespondReportRequest;
};

export const useRespondReport = () => {
	const queryClient = useQueryClient();

	return useMutation<RespondReportResponse, AxiosError<ApiError>, UseRespondReportVariables>({
		mutationFn: async ({ reportId, payload }) => {
			const requestBody = respondReportRequestSchema.parse(payload);
			const response = await apiClient.patch(
				`/academy/admin/reports/${reportId}/response`,
				requestBody
			);

			return respondReportResponseSchema.parse(response.data);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["reports"] });
		},
	});
};
