"use client"

import { getCourseLevel } from "@/lib/constants/course"
import { cn } from "@/lib/utils"

type CourseLevel = "EASY" | "MEDIUM" | "HARD"

type CourseLevelBadgeProps = {
  level: CourseLevel | string
  className?: string
}

const levelClassMap: Record<string, string> = {
  EASY: "bg-secondary/15 text-secondary border-2 border-secondary/40",
  MEDIUM: "bg-warning/15 text-warning border-2 border-warning/40",
  HARD: "bg-error/15 text-error border-2 border-error/40",
}

export default function CourseLevelBadge({
  level,
  className,
}: CourseLevelBadgeProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded px-2 py-1 text-xs font-medium",
        levelClassMap[level] ??
          "bg-greyscale-700 text-greyscale-100 border-2 border-greyscale-600",
        className,
      )}
    >
      {getCourseLevel(level)}
    </span>
  )
}
