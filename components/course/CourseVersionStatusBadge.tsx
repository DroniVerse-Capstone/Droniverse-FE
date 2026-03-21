"use client"

import { getCourseVersionStatus } from "@/lib/constants/course"
import { cn } from "@/lib/utils"

type CourseVersionStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "DEPRECATED"

type CourseVersionStatusBadgeProps = {
  status: CourseVersionStatus | string
  className?: string
}

const statusClassMap: Record<string, string> = {
  DRAFT: "bg-warning/15 text-warning border border-warning/40",
  ACTIVE: "bg-success/15 text-success border border-success/40",
  INACTIVE: "bg-greyscale-700 text-greyscale-100 border border-greyscale-600",
  DEPRECATED: "bg-error/15 text-error border border-error/40",
}

export default function CourseVersionStatusBadge({
  status,
  className,
}: CourseVersionStatusBadgeProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded px-2 py-1 text-xs font-medium",
        statusClassMap[status] ??
          "bg-greyscale-700 text-greyscale-100 border border-greyscale-600",
        className,
      )}
    >
      {getCourseVersionStatus(status)}
    </span>
  )
}
