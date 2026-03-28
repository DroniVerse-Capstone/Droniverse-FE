"use client"

import { getCourseStatus } from "@/lib/constants/course"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/providers/i18n-provider"

type CourseStatus = "DRAFT" | "PUBLISH" | "UNPUBLISH" | "ARCHIVED"

type CourseStatusBadgeProps = {
  status: CourseStatus | string
  className?: string
}

const statusClassMap: Record<string, string> = {
  DRAFT: "bg-warning/15 text-warning border border-warning/40",
  PUBLISH: "bg-success/15 text-success border border-success/40",
  UNPUBLISH: "bg-error/15 text-error border border-error/40",
  ARCHIVED: "bg-greyscale-700 text-greyscale-100 border border-greyscale-600",
}

export default function CourseStatusBadge({
  status,
  className,
}: CourseStatusBadgeProps) {
  const t = useTranslations("CourseManagement");
  return (
    <span
      className={cn(
        "shrink-0 rounded px-2 py-1 text-xs font-medium",
        statusClassMap[status] ??
          "bg-greyscale-700 text-greyscale-100 border border-greyscale-600",
        className,
      )}
    >
      {t(getCourseStatus(status))}
    </span>
  )
}
