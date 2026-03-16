import { z } from 'zod'
import { categorySchema } from '@/validations/category/common-category'

export const clubCreationRequestSchema = z.object({
    nameVN: z.string().min(1),
    nameEN: z.string().min(1),
    description: z.string().min(1),
    isPublic: z.boolean(),
    limitParticipant: z.number().int().positive(),
    limitClubManager: z.number().int().positive(),
    image: z.string(),
    categoryIDs: z.array(z.string()).min(1)
})

export const clubCreationResponseDataSchema = z.object({
    clubCreationRequestID: z.string(),
    nameVN: z.string(),
    nameEN: z.string()
})

export const clubCreationResponseSchema = z.object({
    data: clubCreationResponseDataSchema,
    isSuccess: z.boolean(),
    message: z.string()
})

// ---- GET my requests ----

export const clubCreationRequestItemSchema = z.object({
    clubCreationRequestID: z.string(),
    nameVN: z.string(),
    nameEN: z.string(),
    description: z.string(),
    isPublic: z.boolean(),
    limitParticipant: z.number().int(),
    limitClubManager: z.number().int(),
    imageUrl: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    approvedAt: z.string().nullable(),
    rejectReason: z.string().nullable(),
    clubID: z.string().nullable(),
    requesterID: z.string(),
    approverID: z.string().nullable(),
    approverName: z.string().nullable(),
    approverEmail: z.string().nullable(),
    requesterName: z.string(),
    requesterEmail: z.string(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCEL"]),
    categories: z.array(categorySchema),
})

export const getMyClubCreationRequestsResponseSchema = z.object({
    data: z.array(clubCreationRequestItemSchema),
    isSuccess: z.boolean(),
    message: z.string(),
})

// ---- GET all requests (paginated) ----


export const getAllClubCreationRequestsDataSchema = z.object({
    data: z.array(clubCreationRequestItemSchema),
    totalRecords: z.number().int(),
    pageIndex: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
})

export const getAllClubCreationRequestsResponseSchema = z.object({
    data: getAllClubCreationRequestsDataSchema,
    isSuccess: z.boolean(),
    message: z.string(),
})


// ---- GET request detail ----

export const clubCreationRequestDetailResponseSchema = z.object({
    data: clubCreationRequestItemSchema,
    isSuccess: z.boolean(),
    message: z.string(),
})

// ---- Update request information ----

export const updateClubCreationRequestDataSchema = z.object({
    clubCreationRequestID: z.string(),
    nameVN: z.string(),
    nameEN: z.string(),
    description: z.string(),
    isPublic: z.boolean(),
    limitParticipant: z.number().int(),
    limitClubManager: z.number().int(),
    imageUrl: z.string(),
    updatedAt: z.string(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCEL"]),
    categories: z.array(categorySchema),
})

export const updateClubCreationRequestResponseSchema = z.object({
    data: updateClubCreationRequestDataSchema,
    isSuccess: z.boolean(),
    message: z.string(),
})

// ---- Update request status ----

export const updateClubCreationRequestStatusSchema = z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCEL"]),
    rejectReason: z.string().nullable(),
})

export const updateClubCreationRequestStatusDataSchema = z.object({
    clubCreationRequestID: z.string(),
    nameVN: z.string(),
    nameEN: z.string(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCEL"]),
    updatedAt: z.string(),
    rejectReason: z.string().nullable(),
    clubID: z.string().nullable(),
})

export const updateClubCreationRequestStatusResponseSchema = z.object({
    data: updateClubCreationRequestStatusDataSchema,
    isSuccess: z.boolean(),
    message: z.string(),
})

export type ClubCreationRequest = z.infer<typeof clubCreationRequestSchema>
export type ClubCreationResponseData = z.infer<typeof clubCreationResponseDataSchema>
export type ClubCreationResponse = z.infer<typeof clubCreationResponseSchema>
export type ClubCreationRequestItem = z.infer<typeof clubCreationRequestItemSchema>
export type UpdateClubCreationRequest = z.infer<typeof clubCreationRequestSchema>
export type UpdateClubCreationRequestData = z.infer<typeof updateClubCreationRequestDataSchema>
export type UpdateClubCreationRequestResponse = z.infer<typeof updateClubCreationRequestResponseSchema>
export type GetMyClubCreationRequestsResponse = z.infer<typeof getMyClubCreationRequestsResponseSchema>
export type GetAllClubCreationRequestsData = z.infer<typeof getAllClubCreationRequestsDataSchema>
export type GetAllClubCreationRequestsResponse = z.infer<typeof getAllClubCreationRequestsResponseSchema>
export type ClubCreationRequestDetailResponse = z.infer<typeof clubCreationRequestDetailResponseSchema>
export type UpdateClubCreationRequestStatus = z.infer<typeof updateClubCreationRequestStatusSchema>
export type UpdateClubCreationRequestStatusData = z.infer<typeof updateClubCreationRequestStatusDataSchema>
export type UpdateClubCreationRequestStatusResponse = z.infer<typeof updateClubCreationRequestStatusResponseSchema>
