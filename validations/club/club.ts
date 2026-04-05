import { z } from "zod"

import { categorySchema } from "@/validations/category/category"

export const clubStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "ARCHIVED",
])

export const creatorSchema = z.object({
  userId: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string().nullable(),
  roleName: z.string(),
})

export const clubSchema = z.object({
  clubID: z.string(),
  nameVN: z.string(),
  nameEN: z.string(),
  descriptionVN: z.string().nullable(),
  descriptionEN: z.string().nullable(),
  clubCode: z.string(),
  status: clubStatusSchema,
  isPublic: z.boolean(),
  imageUrl: z.string(). nullable(),
  limitParticipation: z.number().int().nonnegative(),
  limitClubManagers: z.number().int().nonnegative(),
  totalMembers: z.number().int().nonnegative(),
  totalCourses: z.number().int().nonnegative(),
  suspendedReason: z.string().nullable(),
  creator: creatorSchema.nullable(),
  categories: z.array(categorySchema),
})

export const getMyClubsResponseSchema = z.object({
  data: z.array(clubSchema),
  isSuccess: z.boolean(),
  message: z.string(),
})

export const getAllClubsDataSchema = z.object({
  data: z.array(clubSchema),
  totalRecords: z.number().int().nonnegative(),
  pageIndex: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
})

export const getAllClubsResponseSchema = z.object({
  data: getAllClubsDataSchema,
  isSuccess: z.boolean(),
  message: z.string(),
})

export const getClubDetailResponseSchema = z.object({
  data: clubSchema,
  isSuccess: z.boolean(),
  message: z.string(),
})

export const updateClubStatusSchema = z
  .object({
    status: clubStatusSchema,
    reason: z.string().trim().min(1).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.status !== "SUSPENDED" && data.reason != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "Reason is only applicable when status is SUSPENDED",
      })
    }
  })

export const updateClubStatusResponseSchema = z.object({
  data: clubSchema,
  isSuccess: z.boolean(),
  message: z.string(),
})

export type Club = z.infer<typeof clubSchema>
export type ClubStatus = z.infer<typeof clubStatusSchema>
export type GetAllClubsData = z.infer<typeof getAllClubsDataSchema>
export type GetAllClubsResponse = z.infer<typeof getAllClubsResponseSchema>
export type GetMyClubsResponse = z.infer<typeof getMyClubsResponseSchema>
export type GetClubDetailResponse = z.infer<typeof getClubDetailResponseSchema>
export type UpdateClubStatus = z.infer<typeof updateClubStatusSchema>
export type UpdateClubStatusResponse = z.infer<
  typeof updateClubStatusResponseSchema
>