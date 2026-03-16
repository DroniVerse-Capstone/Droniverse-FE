import { z } from "zod"

// Request schemas
export const clubAttemptRequestSchema = z.object({
  clubCode: z.string().min(1, "Club code is required"),
})

// Response schemas
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

// Types
export type ClubAttemptRequest = z.infer<typeof clubAttemptRequestSchema>
export type ClubAttemptData = z.infer<typeof clubAttemptDataSchema>
export type ClubAttemptResponse = z.infer<typeof clubAttemptResponseSchema>