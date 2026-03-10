import { z } from 'zod'

// Request schemas
export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleName: z.string()
})

// Response schemas
export const userSchema = z.object({
  userId: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  dateOfBirth: z.string().nullable(),
  roleName: z.string()
})

export const loginDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema
})

export const loginResponseSchema = z.object({
  data: loginDataSchema,
  isSuccess: z.boolean(),
  message: z.string()
})

export const registerResponseSchema = z.object({
  data: loginDataSchema,
  isSuccess: z.boolean(),
  message: z.string()
})

// Types
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type RegisterRequest = z.infer<typeof registerRequestSchema>
export type User = z.infer<typeof userSchema>
export type LoginData = z.infer<typeof loginDataSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type RegisterResponse = z.infer<typeof registerResponseSchema>
