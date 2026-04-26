import { z } from "zod"

export const levelSchema = z.object({
	levelId: z.string().optional(),
	levelID: z.string().optional(),
	levelNumber: z.number().int().nonnegative(),
	name: z.string(),
	droneInfo: z.object({
		droneId: z.string(),
		droneNameVN: z.string(),
		droneNameEN: z.string()
	}).optional(),
}).transform((data) => ({
	...data,
	levelId: data.levelId || data.levelID || "",
	levelID: data.levelId || data.levelID || "",
}))

export const getLevelsByDroneResponseSchema = z.object({
	data: z.array(levelSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const addLevelCourseRequestSchema = z.object({
	courseIds: z.array(z.string()),
})

export const addLevelCourseResponseSchema = z.object({
	data: z.object({
		created: z.number(),
	}),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type Level = z.infer<typeof levelSchema>
export type GetLevelsByDroneResponse = z.infer<
	typeof getLevelsByDroneResponseSchema
>
export type AddLevelCourseRequest = z.infer<typeof addLevelCourseRequestSchema>
export type AddLevelCourseResponse = z.infer<typeof addLevelCourseResponseSchema>

export const levelPathCourseVersionSchema = z.object({
	courseVersionID: z.string(),
	titleVN: z.string(),
	titleEN: z.string(),
	version: z.number()
})

export const levelPathCourseSchema = z.object({
	courseID: z.string(),
	level: levelSchema.nullable(),
	currentVersion: levelPathCourseVersionSchema.nullable()
})

export const levelPathSchema = z.object({
	level: levelSchema,
	courses: z.array(levelPathCourseSchema)
})

export const getLevelPathResponseSchema = z.object({
	data: z.array(levelPathSchema),
	isSuccess: z.boolean(),
	message: z.string()
})

export type LevelPathCourseVersion = z.infer<typeof levelPathCourseVersionSchema>
export type LevelPathCourse = z.infer<typeof levelPathCourseSchema>
export type LevelPath = z.infer<typeof levelPathSchema>
export type GetLevelPathResponse = z.infer<typeof getLevelPathResponseSchema>
