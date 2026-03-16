import { z } from "zod"

export const categorySchema = z.object({
  categoryId: z.string(),
  typeNameVN: z.string(),
  typeNameEN: z.string(),
  descriptionVN: z.string(),
  descriptionEN: z.string(),
})

export const getCategoriesResponseSchema = z.object({
  data: z.array(categorySchema),
  isSuccess: z.boolean(),
  message: z.string(),
})

export type Category = z.infer<typeof categorySchema>
export type GetCategoriesResponse = z.infer<typeof getCategoriesResponseSchema>