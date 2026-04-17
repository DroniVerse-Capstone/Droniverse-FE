import { z } from "zod"

export const competitionStatusSchema = z.enum([
	"DRAFT",
	"PUBLISHED",
	// "REGISTRATION_OPEN",
	// "REGISTRATION_CLOSED",
	// "ONGOING",
	// "FINISHED",
	"RESULT_PUBLISHED",
	"CANCELLED",
	"INVALID",
])


export const competitionPhaseSchema = z.enum([
	"UPCOMING",
	"COMING_SOON",
	"REGISTRATION_OPEN",
	"REGISTRATION_CLOSED",
	"ONGOING",
	"FINISHED",
	// "CANCELLED",
])

export const competitionUserSchema = z.object({
	userId: z.string(),
	fullName: z.string(),
	email: z.string().email(),
	avatarUrl: z.string().url().nullable().optional(),
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
	competitionStatus: competitionStatusSchema,
	competitionPhase: competitionPhaseSchema.nullable().optional(),
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

export const competitionCertificateSchema = z.object({
	certificateID: z.string(),
	certificateNameVN: z.string(),
	certificateNameEN: z.string(),
	imageUrl: z.string(),
})

export const getCompetitionCertificatesResponseSchema = z.object({
	data: z.array(competitionCertificateSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const assignCompetitionCertificatesRequestSchema = z.object({
	certificateIDs: z.array(z.string()).min(1),
})

const baseCompetitionRequestFields = {
	nameVN: z.string(),
	nameEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	ruleContent: z.string(),
	maxParticipants: z.number().int().positive(),
	visibleAt: z.string(),
	registrationStartDate: z.string(),
	registrationEndDate: z.string(),
	startDate: z.string(),
	endDate: z.string(),
	resultPublishedAt: z.string(),
}

export const createCompetitionRequestSchema = z.object({
	...baseCompetitionRequestFields,
	clubID: z.string(),
}).refine(data => new Date(data.registrationStartDate) >= new Date(data.visibleAt), {
	message: "Ngày bắt đầu đăng ký phải sau hoặc bằng ngày hiển thị",
	path: ["registrationStartDate"],
}).refine(data => new Date(data.registrationEndDate) > new Date(data.registrationStartDate), {
	message: "Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký",
	path: ["registrationEndDate"],
}).refine(data => new Date(data.startDate) > new Date(data.registrationEndDate), {
	message: "Ngày bắt đầu thi phải sau ngày kết thúc đăng ký",
	path: ["startDate"],
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
	message: "Ngày kết thúc thi phải sau ngày bắt đầu thi",
	path: ["endDate"],
}).refine(data => new Date(data.resultPublishedAt) >= new Date(data.endDate), {
	message: "Ngày công bố kết quả phải sau hoặc bằng ngày kết thúc thi",
	path: ["resultPublishedAt"],
})

export const updateCompetitionRequestSchema = z.object(baseCompetitionRequestFields).partial().extend({
	resultPublishedAt: z.string().optional(),
})

export const competitionPrizeSchema = z.object({
	competitionPrizeID: z.string(),
	competitionID: z.string(),
	titleVN: z.string(),
	titleEN: z.string(),
	descriptionVN: z.string().nullable(),
	descriptionEN: z.string().nullable(),
	rewardType: z.enum(["MONEY", "GIFT"]),
	rewardValueMoney: z.number().int().nonnegative().optional().nullable(),
	rewardValueGiftVN: z.string().nullable().optional(),
	rewardValueGiftEN: z.string().nullable().optional(),
	rankFrom: z.number().int().positive(),
	rankTo: z.number().int().positive(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
})

export const getCompetitionPrizesResponseSchema = z.object({
	data: z.array(competitionPrizeSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const createCompetitionPrizeRequestSchema = z.object({
	titleVN: z.string().min(1, "Vui lòng nhập tiêu đề tiếng Việt"),
	titleEN: z.string().min(1, "Vui lòng nhập tiêu đề tiếng Anh"),
	descriptionVN: z.string().nullable(),
	descriptionEN: z.string().nullable(),
	rewardType: z.enum(["MONEY", "GIFT"]),
	rewardValueMoney: z.number().int().nonnegative().nullable(),
	rewardValueGiftVN: z.string().nullable(),
	rewardValueGiftEN: z.string().nullable(),
	rankFrom: z.number().int().positive(),
	rankTo: z.number().int().positive(),
})

export const roundLifeCycleStatusSchema = z.enum([
	"Upcoming",
	"Ongoing",
	"Finished",
])

export const competitionRoundSchema = z.object({
	roundID: z.string(),
	competition: z.object({
		competitionID: z.string(),
		nameVN: z.string(),
		nameEN: z.string(),
	}),
	lab: z.object({
		labID: z.string(),
		labNameVN: z.string(),
		labNameEN: z.string(),
	}),
	roundNumber: z.number().int().nonnegative(),
	startTime: z.string(),
	endTime: z.string(),
	timeLimit: z.string(), // "HH:mm:ss"
	roundStatus: z.string(),
	roundPhase: roundLifeCycleStatusSchema,
	totalParticipants: z.number().int().nonnegative(),
})

export const getCompetitionRoundsResponseSchema = z.object({
	data: z.array(competitionRoundSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const createRoundRequestSchema = z.object({
	competitionID: z.string(),
	labID: z.string(),
	startTime: z.string(), // ISO String
	endTime: z.string(), // ISO String
	limitTime: z.string(), // "HH:mm:ss"
})

export type CompetitionStatus = z.infer<typeof competitionStatusSchema>
export type CompetitionUser = z.infer<typeof competitionUserSchema>
export type Competition = z.infer<typeof competitionSchema>
export type GetCompetitionsByClubResponse = z.infer<
	typeof getCompetitionsByClubResponseSchema
>
export type CreateCompetitionRequest = z.infer<typeof createCompetitionRequestSchema>
export type UpdateCompetitionRequest = z.infer<typeof updateCompetitionRequestSchema>
export type CompetitionCertificate = z.infer<typeof competitionCertificateSchema>
export type AssignCompetitionCertificatesRequest = z.infer<typeof assignCompetitionCertificatesRequestSchema>
export type CompetitionPrize = z.infer<typeof competitionPrizeSchema>
export type CreateCompetitionPrizeRequest = z.infer<typeof createCompetitionPrizeRequestSchema>
export type CompetitionRound = z.infer<typeof competitionRoundSchema>
export type CreateRoundRequest = z.infer<typeof createRoundRequestSchema>

