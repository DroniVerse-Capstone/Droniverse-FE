import { z } from "zod"

export const competitionStatusSchema = z.enum([
	"DRAFT",
	"PUBLISHED",
	"REGISTRATION_OPEN",
	"REGISTRATION_CLOSED",
	"ONGOING",
	"FINISHED",
	"RESULT_PUBLISHED",
	"CANCELLED",
	"INVALID",
])

export const competitionUserSchema = z.object({
	userId: z.string(),
	fullName: z.string(),
	email: z.string().email(),
})

export const competitionSchema = z.object({
	competitionID: z.string(),
	clubID: z.string(),
	nameVN: z.string(),
	nameEN: z.string(),
	descriptionVN: z.string().nullable(),
	descriptionEN: z.string().nullable(),
	ruleContent: z.string(),
	maxParticipants: z.number().int().nonnegative(),
	visibleAt: z.string(),
	registrationStartDate: z.string(),
	registrationEndDate: z.string(),
	startDate: z.string(),
	endDate: z.string(),
	status: competitionStatusSchema,
	resultPublishedAt: z.string().nullable(),
	createdBy: competitionUserSchema,
	updatedBy: competitionUserSchema.nullable(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
	invalidReason: z.string().nullable(),
	invalidAt: z.string().nullable(),
	totalRounds: z.number().int().nonnegative(),
	totalCompetitors: z.number().int().nonnegative(),
	totalPrizes: z.number().int().nonnegative(),
})

export const getCompetitionsByClubResponseSchema = z.object({
	data: z.array(competitionSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type CompetitionStatus = z.infer<typeof competitionStatusSchema>
export type CompetitionUser = z.infer<typeof competitionUserSchema>
export type Competition = z.infer<typeof competitionSchema>
export type GetCompetitionsByClubResponse = z.infer<
	typeof getCompetitionsByClubResponseSchema
>
