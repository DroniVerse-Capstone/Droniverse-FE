import { z } from "zod"

export const levelSchema = z.object({
	levelID: z.string(),
	levelNumber: z.number().int().nonnegative(),
	name: z.string(),
})

export const getLevelsByDroneResponseSchema = z.object({
	data: z.array(levelSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type Level = z.infer<typeof levelSchema>
export type GetLevelsByDroneResponse = z.infer<
	typeof getLevelsByDroneResponseSchema
>
