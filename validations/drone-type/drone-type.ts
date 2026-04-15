import { z } from "zod"

const requiredTrimmedString = z.string().trim().min(1)

export const createDroneTypeRequestSchema = z.object({
  typeNameVN: requiredTrimmedString,
  typeNameEN: requiredTrimmedString,
  descriptionVN: requiredTrimmedString,
  descriptionEN: requiredTrimmedString,
})

export const updateDroneTypeRequestSchema = z.object({
  typeNameVN: requiredTrimmedString,
  typeNameEN: requiredTrimmedString,
  descriptionVN: requiredTrimmedString,
  descriptionEN: requiredTrimmedString,
})

export const droneTypeSchema = z.object({
  droneTypeID: z.string(),
  typeNameVN: z.string(),
  typeNameEN: z.string(),
  descriptionVN: z.string(),
  descriptionEN: z.string(),
})

export const createDroneTypeResponseSchema = z.object({
  data: droneTypeSchema,
  isSuccess: z.boolean(),
  message: z.string(),
})

export const updateDroneTypeResponseSchema = z.object({
  data: droneTypeSchema,
  isSuccess: z.boolean(),
  message: z.string(),
})

export const deleteDroneTypeResponseSchema = z.object({
  isSuccess: z.boolean(),
  message: z.string(),
})

export const getDroneTypesResponseSchema = z.object({
  data: z.array(droneTypeSchema),
  isSuccess: z.boolean(),
  message: z.string(),
})

export type CreateDroneTypeRequest = z.infer<typeof createDroneTypeRequestSchema>
export type UpdateDroneTypeRequest = z.infer<typeof updateDroneTypeRequestSchema>
export type DroneType = z.infer<typeof droneTypeSchema>
export type CreateDroneTypeResponse = z.infer<typeof createDroneTypeResponseSchema>
export type UpdateDroneTypeResponse = z.infer<typeof updateDroneTypeResponseSchema>
export type DeleteDroneTypeResponse = z.infer<typeof deleteDroneTypeResponseSchema>
export type GetDroneTypesResponse = z.infer<typeof getDroneTypesResponseSchema>