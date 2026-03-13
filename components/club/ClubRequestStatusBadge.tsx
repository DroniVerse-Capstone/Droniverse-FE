"use client"

import { getClubRequestStatus } from "@/lib/constants/club"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/providers/i18n-provider"

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED"

type ClubRequestStatusBadgeProps = {
  status: RequestStatus | string
  className?: string
}

const statusClassMap: Record<string, string> = {
  PENDING: "bg-warning/15 text-warning border border-warning/40",
  APPROVED: "bg-success/15 text-success border border-success/40",
  REJECTED: "bg-error/15 text-error border border-error/40",
  CANCELED: "bg-greyscale-700 text-greyscale-100 border border-greyscale-600",
}

export default function ClubRequestStatusBadge({
  status,
  className,
}: ClubRequestStatusBadgeProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded px-2 py-1 text-xs font-medium",
        statusClassMap[status] ?? "bg-greyscale-700 text-greyscale-100 border border-greyscale-600",
        className
      )}
    >
      {getClubRequestStatus(status)}
    </span>
  )
}