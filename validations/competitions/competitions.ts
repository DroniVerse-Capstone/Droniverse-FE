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
	"COMPLETED",
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
	isRegistered: z.boolean().optional(),
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

export const assignCompetitionLevelsRequestSchema = z.object({
	levelIds: z.array(z.string()).min(1),
})

const baseCompetitionRequestFields = {
	nameVN: z.string(),
	nameEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	ruleContent: z.string(),
	maxParticipants: z.number().int().positive().max(1000000, "Số lượng người tham gia không được vượt quá 1,000,000"),
	visibleAt: z.string(),
	registrationStartDate: z.string(),
	registrationEndDate: z.string(),
	startDate: z.string(),
	endDate: z.string(),
	resultPublishedAt: z.string().nullable().optional(),
}

const MIN_GAP_MS = 1 * 60 * 1000; // Đổi thành 1 phút để demo

const validateTimeline = (data: any, ctx: z.RefinementCtx) => {
	const visible = data.visibleAt ? new Date(data.visibleAt).getTime() : null;
	const regStart = data.registrationStartDate ? new Date(data.registrationStartDate).getTime() : null;
	const regEnd = data.registrationEndDate ? new Date(data.registrationEndDate).getTime() : null;
	const start = data.startDate ? new Date(data.startDate).getTime() : null;
	const end = data.endDate ? new Date(data.endDate).getTime() : null;

	if (visible && regStart && regStart < visible + MIN_GAP_MS) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Bắt đầu đăng ký phải sau thời gian hiển thị ít nhất 1 phút",
			path: ["registrationStartDate"],
		});
	}
	if (regStart && regEnd && regEnd < regStart + MIN_GAP_MS) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Kết thúc đăng ký phải sau bắt đầu đăng ký ít nhất 1 phút",
			path: ["registrationEndDate"],
		});
	}
	if (regEnd && start && start < regEnd + MIN_GAP_MS) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Bắt đầu thi phải sau kết thúc đăng ký ít nhất 1 phút",
			path: ["startDate"],
		});
	}
	if (start && end && end < start + MIN_GAP_MS) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Kết thúc thi phải sau bắt đầu thi ít nhất 1 phút",
			path: ["endDate"],
		});
	}
};

export const createCompetitionRequestSchema = z.object({
	...baseCompetitionRequestFields,
	clubID: z.string(),
}).superRefine(validateTimeline)

export const updateCompetitionRequestSchema = z.object(baseCompetitionRequestFields).partial().extend({
	resultPublishedAt: z.string().optional(),
}).superRefine(validateTimeline)

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
	rewardValueMoney: z.number().int().nonnegative("Tiền thưởng không được là số âm").max(1000000000, "Tiền thưởng không được vượt quá 1,000,000,000 VNĐ").nullable(),
	rewardValueGiftVN: z.string().nullable(),
	rewardValueGiftEN: z.string().nullable(),
	rankFrom: z.number().int().positive().max(1000000, "Thứ hạng không được vượt quá 1,000,000"),
	rankTo: z.number().int().positive().max(1000000, "Thứ hạng không được vượt quá 1,000,000"),
})

export const roundLifeCycleStatusSchema = z.enum([
	"Upcoming",
	"Ongoing",
	"Finished",
])

export const roundStatusSchema = z.enum([
	"Valid",
	"ScheduleInvalid",
	"Cancelled",
])

export const competitionRoundSchema = z.preprocess(
	(val: any) => {
		if (val && typeof val === "object") {
			return {
				...val,
				roundID: val.roundID || val.roundId,
				weight: val.weight || val.roundWeight,
			}
		}
		return val
	},
	z.object({
		roundID: z.string(),
		competition: z.object({
			competitionID: z.string(),
			nameVN: z.string(),
			nameEN: z.string(),
		}).optional(),
		vrSimulator: z.object({
			vrSimulatorId: z.string(),
			titleVN: z.string(),
			titleEN: z.string(),
		}),
		roundNumber: z.number().int().nonnegative(),
		startTime: z.string(),
		endTime: z.string(),
		timeLimit: z.string(), // "HH:mm:ss"
		roundStatus: roundStatusSchema,
		roundPhase: roundLifeCycleStatusSchema.nullable().optional(),
		totalParticipants: z.number().int().nonnegative().optional(),
		weight: z.number().int().min(1).max(3).optional(),
		roundWeight: z.number().int().min(1).max(3).optional(),
	})
)

export const getCompetitionRoundsResponseSchema = z.object({
	data: z.array(competitionRoundSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const createRoundRequestSchema = z.object({
	competitionID: z.string(),
	vrSimilatorID: z.string(),
	startTime: z.string(), // ISO String
	endTime: z.string(), // ISO String
	limitTime: z.string(), // "HH:mm:ss"
	weight: z.number().int().min(1).max(3).default(1),
})

export const updateRoundRequestSchema = z.object({
	vrSimulatorID: z.string(),
	startTime: z.string(), // ISO String
	endTime: z.string(), // ISO String
	timeLimit: z.string(), // "HH:mm:ss"
	weight: z.number().int().min(1).max(3).optional(),
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
export type CompetitionRound = z.infer<typeof competitionRoundSchema>
export type CreateRoundRequest = z.infer<typeof createRoundRequestSchema>
export type UpdateRoundRequest = z.infer<typeof updateRoundRequestSchema>
export type CreateCompetitionPrizeRequest = z.infer<typeof createCompetitionPrizeRequestSchema>

export const participantStatusSchema = z.enum([
	"ACTIVE",
	"DISQUALIFIED",
	"WITHDRAWN",
])

export const competitionParticipationSchema = z.object({
	user: competitionUserSchema,
	score: z.number().nullable().optional(),
	rank: z.number().int().nonnegative().nullable().optional(),
	prizeID: z.string().uuid().nullable().optional(),
	status: participantStatusSchema.optional().nullable(),
	createdAt: z.string(),
	updatedAt: z.string().nullable().optional(),
})

export const getCompetitionParticipantsResponseSchema = z.object({
	data: z.object({
		competition: z.object({
			competitionID: z.string().uuid(),
			nameVN: z.string(),
			nameEN: z.string(),
		}),
		participantStatus: z.string(),
		participations: z.object({
			data: z.array(competitionParticipationSchema),
			totalRecords: z.number().int().nonnegative(),
			pageIndex: z.number().int().nonnegative(),
			pageSize: z.number().int().nonnegative(),
			totalPages: z.number().int().nonnegative(),
		}),
	}),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type ParticipantStatus = z.infer<typeof participantStatusSchema>
export type CompetitionParticipation = z.infer<typeof competitionParticipationSchema>
export type GetCompetitionParticipantsResponse = z.infer<typeof getCompetitionParticipantsResponseSchema>

export const roundEntrySchema = z.object({
	user: competitionUserSchema,
	point: z.number(),
	executionTime: z.string().nullable().optional(),
	numberOfSteps: z.number().optional().nullable(),
	pathLength: z.number().optional().nullable(),
	isSequentialCheckpoints: z.boolean().optional().nullable(),
	isPassed: z.boolean(),
	status: z.string(),
	submittedAt: z.string().nullable().optional(),
	rank: z.number().int().nonnegative(),
	isCurrentUser: z.boolean(),
})

export const getRoundLeaderboardResponseSchema = z.object({
	data: z.object({
		data: z.object({
			roundID: z.string().uuid(),
			roundEntries: z.array(roundEntrySchema),
		}),
		totalRecords: z.number().int().nonnegative(),
		pageIndex: z.number().int().nonnegative(),
		pageSize: z.number().int().nonnegative(),
		totalPages: z.number().int().nonnegative(),
	}),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type RoundEntry = z.infer<typeof roundEntrySchema>
export type GetRoundLeaderboardResponse = z.infer<typeof getRoundLeaderboardResponseSchema>

export const competitionLeaderboardEntrySchema = z.object({
	user: competitionUserSchema,
	totalScore: z.number(),
	totalTime: z.string(),
	rank: z.number().int().nonnegative(),
	status: participantStatusSchema.optional().nullable(),
	isCurrentUser: z.boolean().optional(),
})

export const getCompetitionLeaderboardResponseSchema = z.object({
	data: z.object({
		data: z.array(competitionLeaderboardEntrySchema),
		totalRecords: z.number().int().nonnegative(),
		pageIndex: z.number().int().nonnegative(),
		pageSize: z.number().int().nonnegative(),
		totalPages: z.number().int().nonnegative(),
	}),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type CompetitionLeaderboardEntry = z.infer<typeof competitionLeaderboardEntrySchema>
export type GetCompetitionLeaderboardResponse = z.infer<typeof getCompetitionLeaderboardResponseSchema>

// --- New Schemas for Round Monitoring ---

export const userRoundStatusSchema = z.enum(["InProgress", "Completed", "Disqualified"])

export const userRoundResultSchema = z.object({
	userRoundID: z.string().uuid().optional(),
	status: userRoundStatusSchema,
	point: z.number().nullable().optional(),
	executionTime: z.string().nullable().optional(),
	startedAt: z.string().nullable().optional(),
	submittedAt: z.string().nullable().optional(),
	isPassed: z.boolean().optional(),
	rank: z.number().int().nonnegative().optional(),
	round: competitionRoundSchema.optional(),
})

export const roundUserResultSchema = z.object({
	userInfo: competitionUserSchema,
	participantResult: z.object({
		status: userRoundStatusSchema,
		startedAt: z.string().nullable().optional(),
		submittedAt: z.string().nullable().optional(),
		point: z.number().nullable().optional(),
		executionTime: z.string().nullable().optional(),
		isPassed: z.boolean().nullable().optional(),
		rank: z.number().int().nonnegative().nullable().optional(),
	})
})

export const getRoundUserResultsResponseSchema = z.object({
	data: z.object({
		roundInfo: competitionRoundSchema,
		userResults: z.object({
			data: z.array(roundUserResultSchema),
			totalRecords: z.number().int().nonnegative(),
			pageIndex: z.number().int().nonnegative(),
			pageSize: z.number().int().nonnegative(),
			totalPages: z.number().int().nonnegative(),
		})
	}),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type UserRoundStatus = z.infer<typeof userRoundStatusSchema>
export type UserRoundResult = z.infer<typeof userRoundResultSchema>
export type RoundUserResult = z.infer<typeof roundUserResultSchema>
export type GetRoundUserResultsResponse = z.infer<typeof getRoundUserResultsResponseSchema>
