import { z } from "zod"

const requiredTrimmedString = z.string().trim().min(1)

export const createCategoryRequestSchema = z.object({
  typeNameVN: requiredTrimmedString,
  typeNameEN: requiredTrimmedString,
  descriptionVN: requiredTrimmedString,
  descriptionEN: requiredTrimmedString,
})

export const updateCategoryRequestSchema = z.object({
  typeNameVN: requiredTrimmedString,
  typeNameEN: requiredTrimmedString,
  descriptionVN: requiredTrimmedString,
  descriptionEN: requiredTrimmedString,
})

export const categorySchema = z.object({
  categoryId: z.string(),
  typeNameVN: z.string(),
  typeNameEN: z.string(),
  descriptionVN: z.string(),
  descriptionEN: z.string(),
})

export const createCategoryResponseSchema = z.object({
  data: categorySchema,
  isSuccess: z.boolean(),
  message: z.string(),
})

export const updateCategoryResponseSchema = z.object({
  data: categorySchema,
  isSuccess: z.boolean(),
  message: z.string(),
})

export const deleteCategoryResponseSchema = z.object({
  isSuccess: z.boolean(),
  message: z.string(),
})

export const getCategoriesResponseSchema = z.object({
  data: z.array(categorySchema),
  isSuccess: z.boolean(),
  message: z.string(),
})

export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>
export type UpdateCategoryRequest = z.infer<typeof updateCategoryRequestSchema>
export type Category = z.infer<typeof categorySchema>
export type CreateCategoryResponse = z.infer<typeof createCategoryResponseSchema>
export type UpdateCategoryResponse = z.infer<typeof updateCategoryResponseSchema>
export type DeleteCategoryResponse = z.infer<typeof deleteCategoryResponseSchema>
export type GetCategoriesResponse = z.infer<typeof getCategoriesResponseSchema>