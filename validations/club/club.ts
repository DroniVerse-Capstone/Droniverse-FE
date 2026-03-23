import { z } from "zod"

import { categorySchema } from "@/validations/category/common-category"

export const clubSchema = z.object({
  clubID: z.string(),
  nameVN: z.string(),
  nameEN: z.string(),
  descriptionVN: z.string().nullable(),
  descriptionEN: z.string().nullable(),
  clubCode: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "ARCHIVED"]),
  isPublic: z.boolean(),
  imageUrl: z.string(). nullable(),
  limitParticipation: z.number().int().nonnegative(),
  limitClubManagers: z.number().int().nonnegative(),
  totalMembers: z.number().int().nonnegative(),
  totalCourses: z.number().int().nonnegative(),
  creator: z.unknown().nullable(),
  categories: z.array(categorySchema),
})

export const getMyClubsResponseSchema = z.object({
  data: z.array(clubSchema),
  isSuccess: z.boolean(),
  message: z.string(),
})

export const getClubDetailResponseSchema = z.object({
  data: clubSchema,
  isSuccess: z.boolean(),
  message: z.string(),
})

export type Club = z.infer<typeof clubSchema>
export type GetMyClubsResponse = z.infer<typeof getMyClubsResponseSchema>
export type GetClubDetailResponse = z.infer<typeof getClubDetailResponseSchema>