import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import apiClient from "@/lib/api/client"
import { ApiError } from "@/types/api/common"
import {
  Category,
  getCategoriesResponseSchema,
} from "@/validations/category/common-category"

export const useGetCategories = () => {
  return useQuery<Category[], AxiosError<ApiError>>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get("/community/categories")
      const parsed = getCategoriesResponseSchema.parse(response.data)
      return parsed.data
    },
  })
}