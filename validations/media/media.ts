import { z } from "zod"

export const mediaTypeSchema = z.enum(["IMAGE", "VIDEO"])

export const uploadTempMediaDataSchema = z.object({
	mediaID: z.string().uuid(),
	mediaTypeID: z.string().uuid(),
	mediaType: mediaTypeSchema,
	url: z.string().url(),
	createdAt: z.string(),
})

export const uploadTempMediaResponseSchema = z.object({
	data: uploadTempMediaDataSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type MediaType = z.infer<typeof mediaTypeSchema>
export type UploadTempMediaData = z.infer<typeof uploadTempMediaDataSchema>
export type UploadTempMediaResponse = z.infer<typeof uploadTempMediaResponseSchema>
