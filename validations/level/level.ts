import { z } from "zod"

export const levelSchema = z.object({
	levelId: z.string().optional(),
	levelID: z.string().optional(),
	levelNumber: z.number().int().nonnegative(),
	name: z.string(),
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

export type Level = z.infer<typeof levelSchema>
export type GetLevelsByDroneResponse = z.infer<
	typeof getLevelsByDroneResponseSchema
>
