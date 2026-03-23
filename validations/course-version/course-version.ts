import { z } from "zod";

export const createCourseVersionRequestSchema = z.object({
  titleVN: z.string(),
  titleEN: z.string(),
  descriptionVN: z.string(),
  descriptionEN: z.string(),
  contextVN: z.string(),
  contextEN: z.string(),
  imageUrl: z.string(),
  level: z.enum(["EASY", "MEDIUM", "HARD"]),
  estimatedDuration: z.number().int().nonnegative(),
});

export const courseVersionSchema = z.object({
  courseVersionID: z.string(),
  titleVN: z.string(),
  titleEN: z.string(),
  descriptionVN: z.string(),
  descriptionEN: z.string(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "DEPRECATED"]),
  version: z.number().int(),
  imageUrl: z.string().nullable(),
  level: z.enum(["EASY", "MEDIUM", "HARD"]),
  estimatedDuration: z.number().int().nonnegative(),
  updateBy: z.string().nullable(),
  updateAt: z.string().nullable(),
  contextVN: z.string(),
  contextEN: z.string(),
  categories: z.array(z.unknown()),
  requiredDrones: z.array(z.unknown()),
});

export const createCourseVersionResponseSchema = z.object({
  data: courseVersionSchema,
  isSuccess: z.boolean(),
  message: z.string(),
});

export type CreateCourseVersionRequest = z.infer<typeof createCourseVersionRequestSchema>;
export type CourseVersion = z.infer<typeof courseVersionSchema>;
export type CreateCourseVersionResponse = z.infer<typeof createCourseVersionResponseSchema>;
