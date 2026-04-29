import { z } from "zod"

export const lessonTypeSchema = z.enum(["THEORY", "QUIZ", "LAB", "PHYSIC", "LAB_PHYSIC", "VR", "ASSIGNMENT"])

export const lessonSchema = z.object({
	lessonID: z.string().uuid(),
	orderIndex: z.number().int().positive(),
	type: lessonTypeSchema,
	referenceID: z.string().uuid(),
	titleVN: z.string().nullable(),
	titleEN: z.string().nullable(),
	duration: z.number().int().nonnegative().nullish(),
	progress: z.number().min(0).max(100),
	isCompleted: z.boolean(),
	isLocked: z.boolean(),
	lastAccessDate: z.string().nullable(),
})

export const moduleSchema = z.object({
	moduleID: z.string().uuid(),
	titleVN: z.string().nullable(),
	titleEN: z.string().nullable(),
	moduleNumber: z.number().int().positive(),
	totalLessons: z.number().int().nonnegative(),
	duration: z.number().int().nonnegative(),
	progress: z.number().min(0).max(100),
	isCompleted: z.boolean(),
	isLocked: z.boolean(),
	lessons: z.array(lessonSchema),
})

export const userCertificateSchema = z.object({
	certificateID: z.string().uuid(),
	userID: z.string().uuid(),
	achievedDate: z.string(),
	certificateUrl: z.string().url(),
	status: z.enum(["ACHIEVED", "REVOKED"]),
})

export const userLearningPathSchema = z.object({
	enrollmentID: z.string().uuid(),
	courseID: z.string().uuid(),
	courseVersionID: z.string().uuid(),
	status: z.enum(["ACTIVE", "COMPLETED", "DROPPED", "LIMITED_ACCESS"]),
	titleVN: z.string(),
	titleEN: z.string(),
	totalLessons: z.number().int().nonnegative(),
	duration: z.number().int().nonnegative(),
	progress: z.number().min(0).max(100),
	userCertificate: userCertificateSchema.nullable(),
	modules: z.array(moduleSchema),
})

export const getUserLearningPathResponseSchema = z.object({
	data: userLearningPathSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const userLessonStatusSchema = z.enum([
	"INCOMPLETED",
	"IN_PROGRESS",
	"COMPLETED",
])

export const userLessonSchema = z.object({
	userLessonID: z.string().uuid(),
	lessonID: z.string().uuid(),
	userID: z.string().uuid(),
	status: userLessonStatusSchema,
	progress: z.number().min(0).max(100),
	lastAccessDate: z.string().nullable(),
})

export const createUserLessonDataParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	lessonId: z.string().uuid(),
})

export const createUserLessonDataResponseSchema = z.object({
	data: userLessonSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const checkUserLessonExistsParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	lessonId: z.string().uuid(),
})

export const checkUserLessonExistsResponseSchema = z.object({
	data: z.boolean(),
	isSuccess: z.boolean(),
	message: z.string(),
})

// ------------- Complete User Lesson -------------

export const completeUserLessonParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	lessonId: z.string().uuid(),
})

export const completeUserLessonDataSchema = z.object({
	enrollmentID: z.string().uuid(),
	moduleID: z.string().uuid(),
	lessonID: z.string().uuid(),
	isAlreadyCompleted: z.boolean(),
	moduleProgress: z.number().min(0).max(100),
	isModuleCompleted: z.boolean(),
	enrollmentProgress: z.number().min(0).max(100),
	isEnrollmentCompleted: z.boolean(),
	isCertificateIssued: z.boolean(),
})

export const completeUserLessonResponseSchema = z.object({
	data: completeUserLessonDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ------------- Get User Quiz Detail -------------

export const getUserQuizDetailParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	quizId: z.string().uuid(),
})

export const userQuizDetailSchema = z.object({
	quizID: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	timeLimit: z.number().int().positive(),
	totalScore: z.number().int().positive(),
	passScore: z.number().int().nonnegative(),
	createAt: z.string(),
	creator: z.unknown().nullable(),
	updateAt: z.string(),
	updater: z.unknown().nullable(),
})

export const userAttemptSchema = z.object({
	attemptID: z.string().uuid(),
	quizID: z.string().uuid(),
	userID: z.string().uuid(),
	startTime: z.string(),
	submitTime: z.string().nullable(),
	score: z.number().min(0),
	isPassed: z.boolean(),
})

export const getUserQuizDetailDataSchema = z.object({
	quiz: userQuizDetailSchema,
	attempt: userAttemptSchema.nullable(),
})

export const getUserQuizDetailResponseSchema = z.object({
	data: getUserQuizDetailDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ------------- Get User Quiz Questions -------------

export const getUserQuizQuestionsParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	quizId: z.string().uuid(),
})

export const userQuizQuestionOptionSchema = z.object({
	optionKey: z.enum(["A", "B", "C", "D"]),
	contentVN: z.string(),
	contentEN: z.string(),
})

export const userQuizQuestionSchema = z.object({
	questionID: z.string().uuid(),
	contentVN: z.string(),
	contentEN: z.string(),
	options: z.array(userQuizQuestionOptionSchema),
})

export const getUserQuizQuestionsDataSchema = z.object({
	quizID: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	timeLimit: z.number().int().positive(),
	questions: z.array(userQuizQuestionSchema),
})

export const getUserQuizQuestionsResponseSchema = z.object({
	data: getUserQuizQuestionsDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ------------- Get Latest User Quiz Attempt Review -------------

export const getUserQuizAttemptReviewParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	quizId: z.string().uuid(),
})

export const userQuizAnswerKeySchema = z.enum(["A", "B", "C", "D"])

export const userAttemptAnswerSchema = z.object({
	attemptAnswerID: z.string().uuid(),
	attemptID: z.string().uuid(),
	questionID: z.string().uuid(),
	selectedAnswer: userQuizAnswerKeySchema,
	isCorrect: z.boolean(),
	score: z.number().min(0),
})

export const userQuizReviewQuestionSchema = z.object({
	questionID: z.string().uuid(),
	quizID: z.string().uuid(),
	contentVN: z.string(),
	contentEN: z.string(),
	answerA: z.string(),
	answerB: z.string(),
	answerC: z.string(),
	answerD: z.string(),
	answerA_EN: z.string(),
	answerB_EN: z.string(),
	answerC_EN: z.string(),
	answerD_EN: z.string(),
	correctAnswer: userQuizAnswerKeySchema,
	score: z.number().min(0),
})

export const userQuizAttemptReviewQuestionItemSchema = z.object({
	attempt: userAttemptAnswerSchema,
	question: userQuizReviewQuestionSchema,
})

export const getUserQuizAttemptReviewDataSchema = z.object({
	quiz: userQuizDetailSchema,
	attempt: userAttemptSchema,
	questions: z.array(userQuizAttemptReviewQuestionItemSchema),
})

export const getUserQuizAttemptReviewResponseSchema = z.object({
	data: getUserQuizAttemptReviewDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ------------- Submit User Quiz -------------

export const submitUserQuizParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	quizId: z.string().uuid(),
	answers: z.array(
		z.object({
			questionID: z.string().uuid(),
			selectedOptionKey: userQuizAnswerKeySchema,
		})
	),
})

export const submitUserQuizDataSchema = z.object({
	attemptID: z.string().uuid(),
	score: z.number().min(0),
	isPassed: z.boolean(),
	bestScore: z.number().min(0),
	completion: completeUserLessonDataSchema,
})

export const submitUserQuizResponseSchema = z.object({
	data: submitUserQuizDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ------------- Get User Lab Detail -------------

export const getUserLabDetailParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	labId: z.string().uuid(),
})

export const userLabDetailSchema = z.object({
	labID: z.string().uuid(),
	type: z.string().min(1),
	level: z.enum(["EASY", "MEDIUM", "HARD"]),
	status: z.string().min(1),
	estimatedTime: z.number().int().nonnegative(),
	nameVN: z.string(),
	nameEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	createAt: z.string(),
	creator: z.unknown().nullable(),
	updateAt: z.string(),
	updater: z.unknown().nullable(),
})

export const studentUserLabSchema = z.object({
  userLabID: z.string().uuid(),
  userID: z.string().uuid(),
  labID: z.string().uuid(),
  solution: z.string().nullable().optional(),
  isCompleted: z.boolean(),
  time: z.number().nullable().optional(),
  numberOfStep: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  feedbackVN: z.string().nullable().optional(),
  feedbackEN: z.string().nullable().optional(),
  point: z.number().nullable().optional(),
})

export const userLabEnvironmentSchema = z
	.object({
		objects: z.array(z.record(z.string(), z.unknown())),
		map: z.record(z.string(), z.unknown()),
		rule: z.record(z.string(), z.unknown()),
		hasSolution: z.boolean().optional(),
		solution: z.record(z.string(), z.unknown()).optional(),
	})
	.passthrough()

export const userLabContentSchema = z.object({
	labID: z.string().uuid(),
	environment: userLabEnvironmentSchema,
})

export const getUserLabDetailDataSchema = z.object({
	lab: userLabDetailSchema,
	labContent: userLabContentSchema,
	userLab: studentUserLabSchema.nullable(),
})

export const getUserLabMiniDataSchema = z.object({
	lab: userLabDetailSchema,
	userLab: studentUserLabSchema.nullable(),
})

export const getUserLabMiniResponseSchema = z.object({
	data: getUserLabMiniDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getUserLabDetailResponseSchema = z.object({
	data: getUserLabDetailDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type Lesson = z.infer<typeof lessonSchema>
export type Module = z.infer<typeof moduleSchema>
export type UserLearningPath = z.infer<typeof userLearningPathSchema>
export type GetUserLearningPathResponse = z.infer<typeof getUserLearningPathResponseSchema>
export type LessonType = z.infer<typeof lessonTypeSchema>
export type UserLessonStatus = z.infer<typeof userLessonStatusSchema>
export type UserLesson = z.infer<typeof userLessonSchema>
export type CreateUserLessonDataParams = z.infer<
	typeof createUserLessonDataParamsSchema
>
export type CreateUserLessonDataResponse = z.infer<
	typeof createUserLessonDataResponseSchema
>
export type CheckUserLessonExistsParams = z.infer<
	typeof checkUserLessonExistsParamsSchema
>
export type CheckUserLessonExistsResponse = z.infer<
	typeof checkUserLessonExistsResponseSchema
>
export type CompleteUserLessonParams = z.infer<
	typeof completeUserLessonParamsSchema
>
export type CompleteUserLessonData = z.infer<typeof completeUserLessonDataSchema>
export type CompleteUserLessonResponse = z.infer<
	typeof completeUserLessonResponseSchema
>
export type GetUserQuizDetailParams = z.infer<typeof getUserQuizDetailParamsSchema>
export type UserQuizDetail = z.infer<typeof userQuizDetailSchema>
export type GetUserQuizDetailData = z.infer<typeof getUserQuizDetailDataSchema>
export type GetUserQuizDetailResponse = z.infer<
	typeof getUserQuizDetailResponseSchema
>
export type GetUserQuizQuestionsParams = z.infer<
	typeof getUserQuizQuestionsParamsSchema
>
export type UserQuizQuestionOption = z.infer<typeof userQuizQuestionOptionSchema>
export type UserQuizQuestion = z.infer<typeof userQuizQuestionSchema>
export type GetUserQuizQuestionsData = z.infer<
	typeof getUserQuizQuestionsDataSchema
>
export type GetUserQuizQuestionsResponse = z.infer<
	typeof getUserQuizQuestionsResponseSchema
>
export type GetUserQuizAttemptReviewParams = z.infer<
	typeof getUserQuizAttemptReviewParamsSchema
>
export type UserQuizAnswerKey = z.infer<typeof userQuizAnswerKeySchema>
export type UserAttemptAnswer = z.infer<typeof userAttemptAnswerSchema>
export type UserQuizReviewQuestion = z.infer<typeof userQuizReviewQuestionSchema>
export type UserQuizAttemptReviewQuestionItem = z.infer<
	typeof userQuizAttemptReviewQuestionItemSchema
>
export type GetUserQuizAttemptReviewData = z.infer<
	typeof getUserQuizAttemptReviewDataSchema
>
export type GetUserQuizAttemptReviewResponse = z.infer<
	typeof getUserQuizAttemptReviewResponseSchema
>
export type SubmitUserQuizParams = z.infer<typeof submitUserQuizParamsSchema>
export type SubmitUserQuizData = z.infer<typeof submitUserQuizDataSchema>
export type SubmitUserQuizResponse = z.infer<typeof submitUserQuizResponseSchema>
export type GetUserLabDetailParams = z.infer<typeof getUserLabDetailParamsSchema>
export type UserLabDetail = z.infer<typeof userLabDetailSchema>
export type UserLabEnvironment = z.infer<typeof userLabEnvironmentSchema>
export type UserLabContent = z.infer<typeof userLabContentSchema>
export type GetUserLabDetailData = z.infer<typeof getUserLabDetailDataSchema>
export type GetUserLabDetailResponse = z.infer<
	typeof getUserLabDetailResponseSchema
>
export type GetUserLabMiniData = z.infer<typeof getUserLabMiniDataSchema>
export type GetUserLabMiniResponse = z.infer<
	typeof getUserLabMiniResponseSchema
>
export type StudentUserLab = z.infer<typeof studentUserLabSchema>

// ------------- Get User Assignment Detail -------------

export const assignmentSchema = z.object({
	assignmentID: z.string().uuid(),
	titleEN: z.string(),
	titleVN: z.string(),
	descriptionEN: z.string(),
	descriptionVN: z.string(),
	requirement: z.string(),
	estimatedTime: z.number().int().nonnegative(),
	createBy: z.string(),
	updateBy: z.string().nullable(),
	createAt: z.string(),
	updateAt: z.string().nullable(),
})

export const userAssignmentSchema = z.object({
	userAssignmentID: z.string().uuid(),
	assignmentID: z.string().uuid(),
	enrollmentID: z.string().uuid(),
	attemptNumber: z.number().int().positive(),
	mediaID: z.string().uuid().nullable(),
	description: z.string(),
	status: z.enum(["SUBMITTED", "UNDER_REVIEW", "PASSED", "FAILED"]),
	score: z.number().min(0).max(100).nullable(),
	reviewComment: z.string().nullable(),
	reviewedBy: z.string().nullable(),
	reviewedAt: z.string().nullable(),
	submittedAt: z.string(),
}).nullable()

export const getUserAssignmentDetailDataSchema = z.object({
	assignment: assignmentSchema,
	userAssignment: userAssignmentSchema,
})

export const getUserAssignmentDetailParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	assignmentId: z.string().uuid(),
})

export const getUserAssignmentDetailResponseSchema = z.object({
	data: getUserAssignmentDetailDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ------------- Get User Assignment Attempts -------------

export const userAssignmentAttemptSchema = z.object({
	userAssignmentID: z.string().uuid(),
	assignmentID: z.string().uuid(),
	enrollmentID: z.string().uuid(),
	attemptNumber: z.number().int().positive(),
	mediaID: z.string().uuid().nullable(),
	description: z.string(),
	status: z.enum(["SUBMITTED", "UNDER_REVIEW", "PASSED", "FAILED"]),
	score: z.number().min(0).max(100).nullable(),
	reviewComment: z.string().nullable(),
	reviewedBy: z.string().nullable(),
	reviewedAt: z.string().nullable(),
	submittedAt: z.string(),
})

export const getUserAssignmentAttemptsParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	assignmentId: z.string().uuid(),
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(10),
})

export const getUserAssignmentAttemptsDataSchema = z.object({
	data: z.array(userAssignmentAttemptSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
})

export const getUserAssignmentAttemptsResponseSchema = z.object({
	data: getUserAssignmentAttemptsDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

// ------------- Submit User Assignment -------------

export const submitUserAssignmentParamsSchema = z.object({
	enrollmentId: z.string().uuid(),
	assignmentId: z.string().uuid(),
})

export const submitUserAssignmentRequestSchema = z.object({
	mediaID: z.string().uuid(),
	description: z.string(),
})

export const submitUserAssignmentDataSchema = z.object({
	userAssignmentID: z.string().uuid(),
	assignmentID: z.string().uuid(),
	enrollmentID: z.string().uuid(),
	attemptNumber: z.number().int().positive(),
	status: z.enum(["SUBMITTED", "UNDER_REVIEW", "PASSED", "FAILED"]),
	submittedAt: z.string(),
})

export const submitUserAssignmentResponseSchema = z.object({
	data: submitUserAssignmentDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type Assignment = z.infer<typeof assignmentSchema>
export type UserAssignment = z.infer<typeof userAssignmentSchema>
export type GetUserAssignmentDetailParams = z.infer<
	typeof getUserAssignmentDetailParamsSchema
>
export type GetUserAssignmentDetailData = z.infer<
	typeof getUserAssignmentDetailDataSchema
>
export type GetUserAssignmentDetailResponse = z.infer<
	typeof getUserAssignmentDetailResponseSchema
>
export type UserAssignmentAttempt = z.infer<typeof userAssignmentAttemptSchema>
export type GetUserAssignmentAttemptsParams = z.infer<
	typeof getUserAssignmentAttemptsParamsSchema
>
export type GetUserAssignmentAttemptsData = z.infer<
	typeof getUserAssignmentAttemptsDataSchema
>
export type GetUserAssignmentAttemptsResponse = z.infer<
	typeof getUserAssignmentAttemptsResponseSchema
>
export type SubmitUserAssignmentParams = z.infer<
	typeof submitUserAssignmentParamsSchema
>
export type SubmitUserAssignmentRequest = z.infer<
	typeof submitUserAssignmentRequestSchema
>
export type SubmitUserAssignmentData = z.infer<
	typeof submitUserAssignmentDataSchema
>
export type SubmitUserAssignmentResponse = z.infer<
	typeof submitUserAssignmentResponseSchema
>
