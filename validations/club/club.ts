import { z } from "zod"

import { categorySchema } from "@/validations/category/category"
import { userLevelSchema } from "@/validations/auth"

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
  imageUrl: z.string().nullable().optional(),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).nullable().optional(),
})

export const clubDroneSchema = z.object({
  droneID: z.string(),
  droneTypeID: z.string(),
  droneTypeNameVN: z.string(),
  droneTypeNameEN: z.string(),
  droneNameVN: z.string(),
  droneNameEN: z.string(),
  manufacturer: z.string(),
  descriptionVN: z.string().nullable(),
  descriptionEN: z.string().nullable(),
  height: z.number().nonnegative(),
  weight: z.number().nonnegative(),
  status: z.string(),
  imgURL: z.string().nullable(),
})

export const clubParticipationSchema = z.object({
  userId: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  dateOfBirth: z.string().nullable(),
  imageUrl: z.string().nullable().optional(),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).nullable().optional(),
  joinDate: z.string().nullable().optional(),
  userLevelMax: z.array(userLevelSchema).nullable(),
  userLevel: z.array(userLevelSchema).nullable()
})

export const clubSchema = z.object({
  clubID: z.string(),
  nameVN: z.string(),
  nameEN: z.string(),
  descriptionVN: z.string().nullable().optional(),
  descriptionEN: z.string().nullable().optional(),
  clubCode: z.string(),
  status: clubStatusSchema,
  imageUrl: z.string().nullable(),
  limitParticipation: z.number().int().nonnegative(),
  limitClubManagers: z.number().int().nonnegative(),
  totalMembers: z.number().int().nonnegative(),
  totalCourses: z.number().int().nonnegative(),
  suspendedReason: z.string().nullable().optional(),
  clubPolicyVN: z.string(),
  clubPolicyEN: z.string(),
  drone: clubDroneSchema.optional().nullable(),
  creator: creatorSchema.nullable(),
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

export const getClubParticipationsDataSchema = z.object({
  data: z.array(clubParticipationSchema),
  totalRecords: z.number().int().nonnegative(),
  pageIndex: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
})

export const getClubParticipationsResponseSchema = z.object({
  data: getClubParticipationsDataSchema,
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
export type ClubParticipation = z.infer<typeof clubParticipationSchema>
export type ClubDrone = z.infer<typeof clubDroneSchema>
export type GetAllClubsData = z.infer<typeof getAllClubsDataSchema>
export type GetAllClubsResponse = z.infer<typeof getAllClubsResponseSchema>
export type GetClubParticipationsData = z.infer<
  typeof getClubParticipationsDataSchema
>
export type GetClubParticipationsResponse = z.infer<
  typeof getClubParticipationsResponseSchema
>
export type GetMyClubsResponse = z.infer<typeof getMyClubsResponseSchema>
export type GetClubDetailResponse = z.infer<typeof getClubDetailResponseSchema>
export type UpdateClubStatus = z.infer<typeof updateClubStatusSchema>
export type UpdateClubStatusResponse = z.infer<
  typeof updateClubStatusResponseSchema
>