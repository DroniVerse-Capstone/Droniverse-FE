import { z } from "zod"

export const droneStatusFilterSchema = z.enum([
	"All",
	"Active",
	"Inactive",
	"Deprecated",
])

export const droneStatusSchema = z.enum(["ACTIVE", "INACTIVE", "DEPRECATED"])

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
	imgURL: z.string(),
})

export const createDroneRequestSchema = z.object({
	droneNameVN: z.string().min(1),
	droneNameEN: z.string().min(1),
	manufacturer: z.string().min(1),
	descriptionVN: z.string().min(1),
	descriptionEN: z.string().min(1),
	height: z.number().positive(),
	weight: z.number().positive(),
	status: droneStatusSchema,
	imgURL: z.string().url(),
})

export const updateDroneRequestSchema = z.object({
	droneTypeID: z.string().uuid(),
	droneNameVN: z.string().min(1),
	droneNameEN: z.string().min(1),
	manufacturer: z.string().min(1),
	descriptionVN: z.string().min(1),
	descriptionEN: z.string().min(1),
	height: z.number().positive(),
	weight: z.number().positive(),
	status: droneStatusSchema,
	imgURL: z.string().url(),
})

export const createDroneResponseSchema = z.object({
	data: droneSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const updateDroneResponseSchema = z.object({
	data: droneSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export const deleteDroneResponseSchema = z.object({
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getDronesResponseSchema = z.object({
	data: z.array(droneSchema),
	isSuccess: z.boolean(),
	message: z.string(),
})

export const getDroneDetailResponseSchema = z.object({
	data: droneSchema,
	isSuccess: z.boolean(),
	message: z.string(),
})

export type DroneStatusFilter = z.infer<typeof droneStatusFilterSchema>
export type DroneStatus = z.infer<typeof droneStatusSchema>
export type Drone = z.infer<typeof droneSchema>
export type CreateDroneRequest = z.infer<typeof createDroneRequestSchema>
export type CreateDroneResponse = z.infer<typeof createDroneResponseSchema>
export type UpdateDroneRequest = z.infer<typeof updateDroneRequestSchema>
export type UpdateDroneResponse = z.infer<typeof updateDroneResponseSchema>
export type DeleteDroneResponse = z.infer<typeof deleteDroneResponseSchema>
export type GetDronesResponse = z.infer<typeof getDronesResponseSchema>
export type GetDroneDetailResponse = z.infer<typeof getDroneDetailResponseSchema>
