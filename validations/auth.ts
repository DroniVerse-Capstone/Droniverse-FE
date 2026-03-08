import { z } from 'zod'

// Request schemas
export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

// Response schemas
export const userSchema = z.object({
  userId: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  dateOfBirth: z.string(),
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

// Types
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type User = z.infer<typeof userSchema>
export type LoginData = z.infer<typeof loginDataSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
