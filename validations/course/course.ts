import { z } from "zod"

export const courseVersionSchema = z.object({
	courseVersionID: z.string(),
	titleVN: z.string(),
	titleEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED']),
	version: z.number().int(),
	imageUrl: z.string().nullable(),
	level: z.enum(['EASY', 'MEDIUM', 'HARD']),
	estimatedDuration: z.number().int().nonnegative(),
	updateBy: z.string(),
	updateAt: z.string(),
	contextVN: z.string(),
	contextEN: z.string(),
	categories: z.array(z.unknown()),
	requiredDrones: z.array(z.unknown()),
})

export const courseSchema = z.object({
	courseID: z.string(),
	createBy: z.string(),
	createAt: z.string(),
	status: z.enum(['DRAFT', 'PUBLISH', 'UNPUBLISH', 'ARCHIVED']),
	currentVersion: courseVersionSchema.nullable(),
})

export const getCoursesDataSchema = z.object({
	data: z.array(courseSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
})

export const getCoursesResponseSchema = z.object({
	data: getCoursesDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type CourseVersion = z.infer<typeof courseVersionSchema>
export type Course = z.infer<typeof courseSchema>
export type GetCoursesData = z.infer<typeof getCoursesDataSchema>
export type GetCoursesResponse = z.infer<typeof getCoursesResponseSchema>
