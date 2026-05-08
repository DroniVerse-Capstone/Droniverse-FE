import { z } from "zod";

export const systemPolicyTypeSchema = z.enum([
	"PAYMENT",
	"PRIVACY",
	"REFUND",
	"DRONE_SAFETY",
	"TERMS",
]);

export const systemPolicyItemSchema = z.object({
	sysPolicyID: z.string().uuid(),
	type: systemPolicyTypeSchema,
	titleEN: z.string(),
	titleVN: z.string(),
	contentEN: z.string(),
	contentVN: z.string(),
	effectiveDate: z.string(),
	createdAt: z.string(),
	createdBy: z.string().uuid(),
});

export const getSystemPoliciesQuerySchema = z.object({
	currentPage: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(10),
});

export const getSystemPoliciesDataSchema = z.object({
	data: z.array(systemPolicyItemSchema),
	totalRecords: z.number().int().nonnegative(),
	pageIndex: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
});

export const getSystemPoliciesResponseSchema = getSystemPoliciesDataSchema;

export type SystemPolicyType = z.infer<typeof systemPolicyTypeSchema>;
export type SystemPolicy = z.infer<typeof systemPolicyItemSchema>;
export type GetSystemPoliciesQuery = z.infer<typeof getSystemPoliciesQuerySchema>;
export type GetSystemPoliciesData = z.infer<typeof getSystemPoliciesDataSchema>;
export type GetSystemPoliciesResponse = z.infer<typeof getSystemPoliciesResponseSchema>;
