import { z } from "zod";

import { userLevelSchema } from "@/validations/auth";

export const systemUserRoleNameSchema = z.enum([
	"ADMIN",
	"CLUB_MANAGER",
	"CLUB_MEMBER",
	"SYSTEM_MANAGER",
]);

export const sortDirectionSchema = z.enum(["Asc", "Desc"]);

export const systemUserSchema = z.object({
	userId: z.string().uuid(),
	username: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.string().email(),
	dateOfBirth: z.string().nullable(),
	roleName: systemUserRoleNameSchema,
	imageUrl: z.string().url().nullable(),
	gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).nullable(),
	phone: z.string().nullable(),
	userLevelMax: z.array(userLevelSchema).nullable(),
	userLevel: z.array(userLevelSchema).nullable(),
});

export const getUsersDataSchema = z.object({
	data: z.array(systemUserSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
});

export const getUsersResponseSchema = getUsersDataSchema;

export const getUsersQuerySchema = z.object({
	username: z.union([z.string().trim().min(1), z.literal("")]).optional(),
	email: z.union([z.string().trim().min(1), z.literal("")]).optional(),
	roleName: systemUserRoleNameSchema.optional(),
	sortDirection: sortDirectionSchema.optional(),
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(5),
});

export type SystemUserRoleName = z.infer<typeof systemUserRoleNameSchema>;
export type SortDirection = z.infer<typeof sortDirectionSchema>;
export type SystemUser = z.infer<typeof systemUserSchema>;
export type GetUsersData = z.infer<typeof getUsersDataSchema>;
export type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
