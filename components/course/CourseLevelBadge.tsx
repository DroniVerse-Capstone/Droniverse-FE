"use client"

import { getCourseLevel } from "@/lib/constants/course"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/providers/i18n-provider"

type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "MASTER"

type CourseLevelInfo = {
  levelID?: string
  levelNumber?: number
  name?: string | null
}

type CourseLevelBadgeProps = {
  level: CourseLevel | string | CourseLevelInfo
  className?: string
}

const levelClassMap: Record<string, string> = {
  BEGINNER: "bg-secondary/15 text-secondary border-2 border-secondary",
  INTERMEDIATE: "bg-warning/15 text-warning border-2 border-warning",
  ADVANCED: "bg-primary/15 text-primary border-2 border-primary",
  MASTER: "bg-purple-600/15 text-purple-600 border-2 border-purple-400 shadow-[0_4px_20px_rgba(168,85,247,0.25)] font-semibold",
}

const levelNumberMap: Record<number, string> = {
  1: "BEGINNER",
  2: "INTERMEDIATE",
  3: "ADVANCED",
  4: "MASTER",
}

function getLevelKey(level: CourseLevelBadgeProps["level"]) {
  if (typeof level === "string") {
    return level.toUpperCase()
  }

  if (level?.name) {
    return level.name.toUpperCase()
  }

  if (typeof level?.levelNumber === "number") {
    return levelNumberMap[level.levelNumber] ?? ""
  }

  return ""
}

export default function CourseLevelBadge({
  level,
  className,
}: CourseLevelBadgeProps) {
  const t = useTranslations("CourseManagement");
  const levelKey = getLevelKey(level)

  const displayLabel = levelKey
  ? t(getCourseLevel(levelKey))
  : ""

  return (
    <span
      className={cn(
        "shrink-0 rounded px-2 py-1 text-xs font-medium",
        levelClassMap[levelKey] ??
          "bg-greyscale-700 text-greyscale-100 border-2 border-greyscale-600",
        className,
      )}
    >
      {displayLabel}
    </span>
  )
}
