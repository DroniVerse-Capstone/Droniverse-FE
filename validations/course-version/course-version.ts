import { z } from "zod";

export const courseVersionUserSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  email: z.string(),
});

export const courseCategorySchema = z.object({
  categoryID: z.string(),
  typeNameVN: z.string(),
  typeNameEN: z.string(),
  descriptionVN: z.string(),
  descriptionEN: z.string(),
});

export const requiredDroneSchema = z.object({
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
  status: z.string(),
  model3DLink: z.string(),
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
  categories: z.array(courseCategorySchema),
  requiredDrones: z.array(requiredDroneSchema),
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

export const deleteCourseVersionResponseSchema = z.object({
  isSuccess: z.boolean(),
  message: z.string(),
});

export const duplicateCourseVersionResponseSchema = z.object({
  data: courseVersionSchema,
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
export type CourseCategory = z.infer<typeof courseCategorySchema>;
export type RequiredDrone = z.infer<typeof requiredDroneSchema>;
export type CourseVersion = z.infer<typeof courseVersionSchema>;
export type CreateCourseVersionResponse = z.infer<typeof createCourseVersionResponseSchema>;
export type UpdateCourseVersionResponse = z.infer<typeof updateCourseVersionResponseSchema>;
export type ActivateCourseVersionResponse = z.infer<typeof activateCourseVersionResponseSchema>;
export type DeleteCourseVersionResponse = z.infer<typeof deleteCourseVersionResponseSchema>;
export type DuplicateCourseVersionResponse = z.infer<typeof duplicateCourseVersionResponseSchema>;
export type GetCourseVersionsData = z.infer<typeof getCourseVersionsDataSchema>;
export type GetCourseVersionsResponse = z.infer<typeof getCourseVersionsResponseSchema>;
export type GetCourseVersionDetailResponse = z.infer<typeof getCourseVersionDetailResponseSchema>;
