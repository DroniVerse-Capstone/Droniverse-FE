import { z } from "zod"

export const droneStatusFilterSchema = z.enum([
	"All",
	"Draft",
	"Available",
	"Maintenance",
])

export const droneStatusSchema = z.enum(["DRAFT", "AVAILABLE", "MAINTENANCE"])

export const droneSchema = z.object({
	droneID: z.string(),
	droneTypeID: z.string(),
	droneTypeNameVN: z.string(),
	droneTypeNameEN: z.string(),
	droneNameVN: z.string(),
	droneNameEN: z.string(),
	manufacturer: z.string(),
	descriptionVN: z.string(),
	descriptionEN: z.string(),
	height: z.number(),
	weight: z.number(),
	status: droneStatusSchema,
	model3DLink: z.string(),
})

export const getDronesResponseSchema = z.object({
	data: z.array(droneSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export type DroneStatusFilter = z.infer<typeof droneStatusFilterSchema>
export type DroneStatus = z.infer<typeof droneStatusSchema>
export type Drone = z.infer<typeof droneSchema>
export type GetDronesResponse = z.infer<typeof getDronesResponseSchema>
