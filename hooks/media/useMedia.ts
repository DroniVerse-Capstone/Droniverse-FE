import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
	MediaType,
	UploadTempMediaResponse,
	uploadTempMediaResponseSchema,
} from "@/validations/media/media"

export type UploadTempMediaVariables = {
	file: File
	mediaType: MediaType
}

type UseUploadTempMediaOptions = {
	onSuccess?: (data: UploadTempMediaResponse) => void
	onError?: (error: AxiosError<ApiError>) => void
}

export const useUploadTempMedia = (options?: UseUploadTempMediaOptions) => {
	return useMutation<
		UploadTempMediaResponse,
		AxiosError<ApiError>,
		UploadTempMediaVariables
	>({
		mutationFn: async ({ file, mediaType }) => {
			if (!file) {
				throw new Error("file is required")
			}

			const formData = new FormData()
			formData.append("File", file)
			formData.append("MediaType", mediaType)

			const response = await apiClient.post(
				"/community/media/upload-temp",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			)

			return uploadTempMediaResponseSchema.parse(response.data)
		},
		onSuccess: (data) => {
			options?.onSuccess?.(data)
		},
		onError: (error) => {
			options?.onError?.(error)
		},
	})
}
