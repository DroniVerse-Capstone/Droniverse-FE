import { z } from "zod"

export const lessonTypeSchema = z.enum(["THEORY", "QUIZ", "LAB"])

export const lessonSchema = z.object({
	lessonID: z.string().uuid(),
	orderIndex: z.number().int().positive(),
	type: lessonTypeSchema,
	referenceID: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	duration: z.number().int().nonnegative(),
	progress: z.number().min(0).max(100),
	isCompleted: z.boolean(),
	isLocked: z.boolean(),
	lastAccessDate: z.string().nullable(),
})

export const moduleSchema = z.object({
	moduleID: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	moduleNumber: z.number().int().positive(),
	totalLessons: z.number().int().nonnegative(),
	duration: z.number().int().nonnegative(),
	progress: z.number().min(0).max(100),
	isCompleted: z.boolean(),
	isLocked: z.boolean(),
	lessons: z.array(lessonSchema),
})

export const userLearningPathSchema = z.object({
	enrollmentID: z.string().uuid(),
	courseID: z.string().uuid(),
	courseVersionID: z.string().uuid(),
	titleVN: z.string(),
	titleEN: z.string(),
	totalLessons: z.number().int().nonnegative(),
	duration: z.number().int().nonnegative(),
	progress: z.number().min(0).max(100),
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

export const getUserQuizQuestionsResponseSchema = z.object({
	data: z.array(userQuizQuestionSchema),
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
	userLab: z.unknown().nullable(),
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
