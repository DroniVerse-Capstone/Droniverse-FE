"use client"

import { getClubStatus } from "@/lib/constants/club"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/providers/i18n-provider"

type ClubStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED"

type ClubStatusBadgeProps = {
  status: ClubStatus | string
  className?: string
}

const statusClassMap: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success border border-success/40",
  INACTIVE: "bg-warning/15 text-warning border border-warning/40",
  SUSPENDED: "bg-error/15 text-error border border-error/40",
  ARCHIVED: "bg-slate-500/15 text-slate-300 border border-slate-500/25",
}

export default function ClubStatusBadge({
  status,
  className,
}: ClubStatusBadgeProps) {
  const t = useTranslations("ClubDashboard")
  return (
    <span
      className={cn(
        "shrink-0 rounded px-2 py-1 text-xs font-medium",
        statusClassMap[status] ?? "bg-greyscale-700 text-greyscale-100 border border-greyscale-600",
        className
      )}
    >
      {t(getClubStatus(status))}
    </span>
  )
}