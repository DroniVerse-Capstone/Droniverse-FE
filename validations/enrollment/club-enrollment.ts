import { z } from "zod";
import { enrollmentStatusSchema, levelSchema } from "./user-enrollment";

export const clubEnrollmentUserSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable(),
});

export const clubEnrollmentSchema = z.object({
  enrollmentId: z.string().uuid(),
  courseId: z.string().uuid(),
  courseVersionId: z.string().uuid(),
  courseNameVN: z.string(),
  courseNameEN: z.string(),
  imageUrl: z.string().url().nullable(),
  estimatedDuration: z.number().int().nonnegative(),
  progress: z.number().min(0).max(100),
  enrollStatus: enrollmentStatusSchema,
  level: levelSchema,
  user: clubEnrollmentUserSchema,
});

export const getClubEnrollmentsQuerySchema = z.object({
  clubId: z.string().uuid(),
  courseId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  pageIndex: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
});

export const getClubEnrollmentsDataSchema = z.object({
  data: z.array(clubEnrollmentSchema),
  totalRecords: z.number().int().nonnegative(),
  pageIndex: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const getClubEnrollmentsResponseSchema = z.object({
  data: getClubEnrollmentsDataSchema,
  isSuccess: z.boolean(),
  message: z.string(),
});

// API 2: Learning Path
export const lessonTypeSchema = z.enum([
  "THEORY",
  "QUIZ",
  "VR",
  "LAB",
  "PHYSIC",
  "LAB_PHYSIC",
]);

export const clubEnrollmentLessonSchema = z.object({
  lessonID: z.string().uuid(),
  orderIndex: z.number().int().nonnegative(),
  type: lessonTypeSchema,
  referenceID: z.string().uuid(),
  titleVN: z.string(),
  titleEN: z.string(),
  duration: z.number().int().nonnegative(),
  progress: z.number().min(0).max(100),
  isCompleted: z.boolean(),
  isLocked: z.boolean(),
  lastAccessDate: z.string().nullable(),
});

export const clubEnrollmentModuleSchema = z.object({
  moduleID: z.string().uuid(),
  titleVN: z.string(),
  titleEN: z.string(),
  moduleNumber: z.number().int().nonnegative(),
  totalLessons: z.number().int().nonnegative(),
  duration: z.number().int().nonnegative(),
  progress: z.number().min(0).max(100),
  isCompleted: z.boolean(),
  isLocked: z.boolean(),
  lessons: z.array(clubEnrollmentLessonSchema),
});

export const getLearningPathDataSchema = z.object({
  enrollmentID: z.string().uuid(),
  courseID: z.string().uuid(),
  courseVersionID: z.string().uuid(),
  status: enrollmentStatusSchema,
  titleVN: z.string(),
  titleEN: z.string(),
  totalLessons: z.number().int().nonnegative(),
  duration: z.number().int().nonnegative(),
  progress: z.number().min(0).max(100),
  userCertificate: z.any().nullable(), // Could be more specific if we had the type
  modules: z.array(clubEnrollmentModuleSchema),
});

export const getLearningPathResponseSchema = z.object({
  data: getLearningPathDataSchema,
  isSuccess: z.boolean(),
  message: z.string(),
});

export type ClubEnrollment = z.infer<typeof clubEnrollmentSchema>;
export type GetClubEnrollmentsQuery = z.infer<typeof getClubEnrollmentsQuerySchema>;
export type GetClubEnrollmentsData = z.infer<typeof getClubEnrollmentsDataSchema>;
export type GetClubEnrollmentsResponse = z.infer<typeof getClubEnrollmentsResponseSchema>;

export type LearningPathData = z.infer<typeof getLearningPathDataSchema>;
export type LearningPathModule = z.infer<typeof clubEnrollmentModuleSchema>;
export type LearningPathLesson = z.infer<typeof clubEnrollmentLessonSchema>;
export type GetLearningPathResponse = z.infer<typeof getLearningPathResponseSchema>;
