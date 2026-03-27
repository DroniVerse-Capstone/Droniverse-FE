import { z } from "zod";

export const courseVersionUserSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  email: z.string(),
});

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

export const updateCourseVersionRequestSchema = z.object({
  titleVN: z.string(),
  titleEN: z.string(),
  descriptionVN: z.string(),
  descriptionEN: z.string(),
  contextVN: z.string(),
  contextEN: z.string(),
  imageUrl: z.string(),
  level: z.enum(["EASY", "MEDIUM", "HARD"]),
  estimatedDuration: z.number().int().nonnegative(),
  changeLog: z.string().trim().min(1),
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
  changeLog: z.string().nullable(),
  updater: courseVersionUserSchema.nullable(),
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

export const updateCourseVersionResponseSchema = z.object({
  data: courseVersionSchema,
  isSuccess: z.boolean(),
  message: z.string(),
});

export const activateCourseVersionResponseSchema = z.object({
  isSuccess: z.boolean(),
  message: z.string(),
});

export const deactivateCourseVersionResponseSchema = z.object({
  isSuccess: z.boolean(),
  message: z.string(),
});

export const getCourseVersionsDataSchema = z.object({
  data: z.array(courseVersionSchema),
  totalRecords: z.number().int().nonnegative(),
  pageIndex: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const getCourseVersionsResponseSchema = z.object({
  data: getCourseVersionsDataSchema,
  isSuccess: z.boolean(),
  message: z.string(),
});

export const getCourseVersionDetailResponseSchema = z.object({
  data: courseVersionSchema,
  isSuccess: z.boolean(),
  message: z.string(),
});

export type CreateCourseVersionRequest = z.infer<typeof createCourseVersionRequestSchema>;
export type UpdateCourseVersionRequest = z.infer<typeof updateCourseVersionRequestSchema>;
export type CourseVersion = z.infer<typeof courseVersionSchema>;
export type CreateCourseVersionResponse = z.infer<typeof createCourseVersionResponseSchema>;
export type UpdateCourseVersionResponse = z.infer<typeof updateCourseVersionResponseSchema>;
export type ActivateCourseVersionResponse = z.infer<typeof activateCourseVersionResponseSchema>;
export type DeactivateCourseVersionResponse = z.infer<typeof deactivateCourseVersionResponseSchema>;
export type GetCourseVersionsData = z.infer<typeof getCourseVersionsDataSchema>;
export type GetCourseVersionsResponse = z.infer<typeof getCourseVersionsResponseSchema>;
export type GetCourseVersionDetailResponse = z.infer<typeof getCourseVersionDetailResponseSchema>;
