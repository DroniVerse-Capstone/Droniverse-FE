import { z } from 'zod'

export const clubCreationRequestSchema = z.object({
	nameVN: z.string().min(1),
	nameEN: z.string().min(1),
	description: z.string().min(1),
	isPublic: z.boolean(),
	limitParticipant: z.number().int().positive(),
	limitClubManager: z.number().int().positive(),
	image: z.string(),
	categoryIDs: z.array(z.string()).min(1)
})

export const clubCreationResponseDataSchema = z.object({
	clubCreationRequestID: z.string().uuid(),
	nameVN: z.string(),
	nameEN: z.string()
})

export const clubCreationResponseSchema = z.object({
	data: clubCreationResponseDataSchema,
	isSuccess: z.boolean(),
	message: z.string()
})

export type ClubCreationRequest = z.infer<typeof clubCreationRequestSchema>
export type ClubCreationResponseData = z.infer<typeof clubCreationResponseDataSchema>
export type ClubCreationResponse = z.infer<typeof clubCreationResponseSchema>
