import { certificateInfoSchema } from "@/validations/course-version/course-version"
import { z } from "zod"

export const courseUserSchema = z.object({
	userId: z.string(),
	fullName: z.string(),
	email: z.string(),
	avatarUrl: z.string().nullable().optional(),
})

export const courseLevelSchema = z.object({
	levelID: z.string(),
	levelNumber: z.number().int().nonnegative(),
	name: z.string(),
})

export const courseDroneSchema = z.object({
	droneID: z.string(),
	name: z.string(),
	imgURL: z.string(),
})

export const miniProductSchema = z.object({
	productId: z.string(),
	referenceId: z.string(),
	price: z.number().int().nonnegative(),
	currency: z.enum(["USD", "VND"]),
	status: z.enum(["Active", "Inactive"]),
})

export const courseProductStatusSchema = z.enum(["ACTIVE", "INACTIVE"])

export const createCourseProductRequestSchema = z.object({
	productNameVN: z.string().min(1),
	productNameEN: z.string().min(1),
	descriptionVN: z.string().min(1),
	descriptionEN: z.string().min(1),
	referenceId: z.string().uuid(),
	price: z.number().int().nonnegative(),
	currency: z.enum(["USD", "VND"]),
	status: courseProductStatusSchema,
})

export const updateCourseProductRequestSchema = createCourseProductRequestSchema

export const createCourseInitialVersionSchema = z.object({
	titleVN: z.string().min(1),
	titleEN: z.string().min(1),
	descriptionVN: z.string().min(1),
	descriptionEN: z.string().min(1),
	contextVN: z.string().min(1),
	contextEN: z.string().min(1),
	imageUrl: z.string().min(1),
	estimatedDuration: z.number().int().nonnegative(),
	changeLog: z.string().nullable().optional(),
})

export const createCourseRequestSchema = z.object({
	levelID: z.string().min(1),
	version: createCourseInitialVersionSchema,
})

export const courseProductSchema = z.object({
	productId: z.string(),
	referenceId: z.string(),
	productNameVN: z.string(),
	productNameEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	price: z.number().int().nonnegative(),
	currency: z.enum(["USD", "VND"]),
	status: courseProductStatusSchema,
	createAt: z.string(),
	updateAt: z.string(),
})

export const courseVersionSchema = z.object({
	courseVersionID: z.string(),
	titleVN: z.string(),
	titleEN: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED']),
	version: z.number().int(),
	imageUrl: z.string().nullable(),
	estimatedDuration: z.number().int().nonnegative(),
	changeLog: z.string().nullable(),
	updater: courseUserSchema.nullable(),
	updateAt: z.string().nullable(),
	contextVN: z.string(),
	contextEN: z.string(),
	certificate: certificateInfoSchema.nullable(),
})

export const courseSchema = z.object({
	courseID: z.string(),
	creator: courseUserSchema,
	createAt: z.string(),
	status: z.enum(['DRAFT', 'PUBLISH', 'UNPUBLISH', 'ARCHIVED']),
	level: courseLevelSchema.nullable(),
	drone: courseDroneSchema.nullable(),
	currentVersion: courseVersionSchema.nullable(),
	courseVersions: z.array(courseVersionSchema).default([]),
	miniProduct: miniProductSchema.nullable().optional(),
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

export const createCourseResponseSchema = z.object({
	data: courseSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const publishCourseResponseSchema = z.object({
	isSuccess: z.boolean(),
	message: z.string(),
})

export const unpublishCourseResponseSchema = z.object({
	isSuccess: z.boolean(),
	message: z.string(),
})

export const deleteCourseResponseSchema = z.object({
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getCourseDetailResponseSchema = z.object({
	data: courseSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const createCourseProductResponseSchema = courseProductSchema
export const updateCourseProductResponseSchema = courseProductSchema

export type CourseVersion = z.infer<typeof courseVersionSchema>
export type Course = z.infer<typeof courseSchema>
export type CourseProductStatus = z.infer<typeof courseProductStatusSchema>
export type CreateCourseRequest = z.infer<typeof createCourseRequestSchema>
export type CreateCourseProductRequest = z.infer<
	typeof createCourseProductRequestSchema
>
export type UpdateCourseProductRequest = z.infer<
	typeof updateCourseProductRequestSchema
>
export type CourseProduct = z.infer<typeof courseProductSchema>
export type GetCoursesData = z.infer<typeof getCoursesDataSchema>
export type GetCoursesResponse = z.infer<typeof getCoursesResponseSchema>
export type CreateCourseResponse = z.infer<typeof createCourseResponseSchema>
export type CreateCourseProductResponse = z.infer<
	typeof createCourseProductResponseSchema
>
export type UpdateCourseProductResponse = z.infer<
	typeof updateCourseProductResponseSchema
>
export type PublishCourseResponse = z.infer<typeof publishCourseResponseSchema>
export type UnpublishCourseResponse = z.infer<typeof unpublishCourseResponseSchema>
export type DeleteCourseResponse = z.infer<typeof deleteCourseResponseSchema>
export type GetCourseDetailResponse = z.infer<typeof getCourseDetailResponseSchema>
