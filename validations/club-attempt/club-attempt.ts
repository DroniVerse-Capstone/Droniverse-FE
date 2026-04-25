import { userLevelSchema } from "@/validations/auth";
import { z } from "zod"

// ---- Post my request ----
export const clubAttemptRequestSchema = z.object({
  clubCode: z.string().min(1, "Club code is required"),
  mediaId: z.string().uuid("Media ID must be a valid UUID"),
})

export const clubAttemptDataSchema = z.object({
  clubID: z.string(),
  nameVN: z.string(),
  nameEN: z.string(),
  clubAttemptRequestID: z.string().nullable(),
})

export const clubAttemptResponseSchema = z.object({
  data: clubAttemptDataSchema,
  isSuccess: z.boolean(),
  message: z.string(),
})

// ---- Get my requests ----
export const clubAttemptMediaSchema = z.object({
  mediaID: z.string(),
  mediaTypeID: z.string(),
  mediaTypeName: z.enum(["IMAGE", "VIDEO"]).nullable(),
  mediaType: z.string().nullable(),
  url: z.string(),
  createdAt: z.string(),
});

export const clubAttemptRequestItemSchema = z.object({
  clubRequestID: z.string(),
  requesterID: z.string(),
  approverID: z.string().nullable(),
  clubRequirement: z.string().nullable(),
  clubID: z.string(),
  clubNameVN: z.string(),
  clubNameEN: z.string(),
  clubImageUrl: z.string().nullable().optional(),
  requesterName: z.string().nullable(),
  requesterEmail: z.string().nullable(),
  approverName: z.string().nullable(),
  approverEmail: z.string().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REJECT"]),
  createAt: z.string(),
  processedAt: z.string().nullable(),
  media: clubAttemptMediaSchema.nullable(),
  userLevelMax: z.array(userLevelSchema).nullable(),
  userLevel: z.array(userLevelSchema).nullable()
});

export const getMyClubAttemptRequestsResponseSchema = z.object({
  data: z.array(clubAttemptRequestItemSchema),
  isSuccess: z.boolean(),
  message: z.string(),
});

export const getClubAttemptRequestsByClubDataSchema = z.object({
  data: z.array(clubAttemptRequestItemSchema),
  totalRecords: z.number().int().nonnegative(),
  pageIndex: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const getClubAttemptRequestsByClubResponseSchema = z.object({
  data: getClubAttemptRequestsByClubDataSchema,
  isSuccess: z.boolean(),
  message: z.string(),
});

// ---- Update request status ----
export const updateClubAttemptRequestStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECT"]),
});

export const updateClubAttemptRequestStatusDataSchema = z.object({
  clubRequestID: z.string(),
  requesterID: z.string(),
  clubID: z.string(),
  clubNameVN: z.string(),
  clubNameEN: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECT"]),
  processedAt: z.string().nullable(),
  participationID: z.string().nullable(),
});

export const updateClubAttemptRequestStatusResponseSchema = z.object({
  isSuccess: z.boolean(),
  message: z.string(),
  data: updateClubAttemptRequestStatusDataSchema,
});

// Types
export type ClubAttemptRequest = z.infer<typeof clubAttemptRequestSchema>
export type ClubAttemptData = z.infer<typeof clubAttemptDataSchema>
export type ClubAttemptResponse = z.infer<typeof clubAttemptResponseSchema>
export type ClubAttemptRequestItem = z.infer<typeof clubAttemptRequestItemSchema>;
export type GetMyClubAttemptRequestsResponse = z.infer<typeof getMyClubAttemptRequestsResponseSchema>;
export type GetClubAttemptRequestsByClubData = z.infer<
  typeof getClubAttemptRequestsByClubDataSchema
>;
export type GetClubAttemptRequestsByClubResponse = z.infer<
  typeof getClubAttemptRequestsByClubResponseSchema
>;
export type UpdateClubAttemptRequestStatus = z.infer<
  typeof updateClubAttemptRequestStatusSchema
>;
export type UpdateClubAttemptRequestStatusData = z.infer<
  typeof updateClubAttemptRequestStatusDataSchema
>;
export type UpdateClubAttemptRequestStatusResponse = z.infer<
  typeof updateClubAttemptRequestStatusResponseSchema
>;