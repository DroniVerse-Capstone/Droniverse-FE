import { z } from "zod"

// ---- Post my request ----
export const clubAttemptRequestSchema = z.object({
  clubCode: z.string().min(1, "Club code is required"),
})

export const clubAttemptDataSchema = z.object({
  clubID: z.string(),
  nameVN: z.string(),
  nameEN: z.string(),
  clubAttemptRequestID: z.string().nullable(),
  clubIsPublic: z.boolean(),
})

export const clubAttemptResponseSchema = z.object({
  data: clubAttemptDataSchema,
  isSuccess: z.boolean(),
  message: z.string(),
})

// ---- Get my requests ----
export const clubAttemptRequestItemSchema = z.object({
  clubRequestID: z.string(),
  requesterID: z.string(),
  approverID: z.string().nullable(),
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
});

export const getMyClubAttemptRequestsResponseSchema = z.object({
  data: z.array(clubAttemptRequestItemSchema),
  isSuccess: z.boolean(),
  message: z.string(),
});

// Types
export type ClubAttemptRequest = z.infer<typeof clubAttemptRequestSchema>
export type ClubAttemptData = z.infer<typeof clubAttemptDataSchema>
export type ClubAttemptResponse = z.infer<typeof clubAttemptResponseSchema>
export type ClubAttemptRequestItem = z.infer<typeof clubAttemptRequestItemSchema>;
export type GetMyClubAttemptRequestsResponse = z.infer<typeof getMyClubAttemptRequestsResponseSchema>;