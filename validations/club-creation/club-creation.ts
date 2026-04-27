import { z } from 'zod'

export const clubCreationRequestSchema = z.object({
    droneID: z.string().uuid(),
    clubPolicyVN: z.string().min(1),
    clubPolicyEN: z.string().min(1),
    clubRequirement: z.string().min(1),
    media: z.string().uuid(),
    nameVN: z.string().min(1),
    nameEN: z.string().min(1),
    description: z.string().min(1),
    limitParticipant: z.number().int().positive(),
    image: z.string(),
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

export const clubCreationMediaSchema = z.object({
    mediaID: z.string(),
    mediaTypeID: z.string().optional(),
    mediaTypeName: z.enum(["IMAGE", "VIDEO"]).optional(),
    mediaType: z.string().optional(),
    url: z.string(),
    createdAt: z.string(),
})

export const clubCreationDroneSchema = z.object({
    droneID: z.string(),
    droneTypeID: z.string(),
    droneTypeNameVN: z.string(),
    droneTypeNameEN: z.string(),
    droneNameVN: z.string(),
    droneNameEN: z.string(),
    manufacturer: z.string(),
    descriptionVN: z.string().nullable(),
    descriptionEN: z.string().nullable(),
    height: z.number().nonnegative(),
    weight: z.number().nonnegative(),
    status: z.string(),
    imgURL: z.string().nullable(),
})

export const clubCreationRequestItemSchema = z.object({
    clubCreationRequestID: z.string(),
    nameVN: z.string(),
    nameEN: z.string(),
    description: z.string(),
    limitParticipant: z.number().int(),
    limitClubManager: z.number().int(),
    imageUrl: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string().nullable().optional(),
    approvedAt: z.string().nullable().optional(),
    rejectReason: z.string().nullable().optional(),
    clubID: z.string().nullable().optional(),
    requesterID: z.string(),
    approverID: z.string().nullable().optional(),
    approverName: z.string().nullable().optional(),
    approverEmail: z.string().nullable().optional(),
    requesterName: z.string().nullable(),
    requesterEmail: z.string().nullable(),
    clubRequirement: z.string().nullable(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCEL"]),
    clubPolicyVN: z.string().nullable().optional(),
    clubPolicyEN: z.string().nullable().optional(),
    media: clubCreationMediaSchema.nullable(),
    drone: clubCreationDroneSchema.nullable().optional(),
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
    droneID: z.string().uuid(),
    clubPolicyVN: z.string().min(1),
    clubPolicyEN: z.string().min(1),
    media: z.string().uuid(),
    nameVN: z.string().min(1),
    nameEN: z.string().min(1),
    description: z.string().min(1),
    limitParticipant: z.number().int().positive(),
    image: z.string(),
})

export const updateClubCreationResponseDataSchema = z.object({
    clubCreationRequestID: z.string(),
    nameVN: z.string(),
    nameEN: z.string(),
    description: z.string(),
    limitParticipant: z.number().int(),
    limitClubManager: z.number().int(),
    imageUrl: z.string().nullable(),
    updatedAt: z.string(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCEL"]),
    droneID: z.string().uuid(),
    clubPolicyVN: z.string().min(1),
    clubPolicyEN: z.string().min(1),
    media: clubCreationMediaSchema.nullable(),
})

export const updateClubCreationRequestResponseSchema = z.object({
    data: updateClubCreationResponseDataSchema,
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
