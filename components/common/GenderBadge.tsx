"use client"

import { cn } from "@/lib/utils"
import { useLocale } from "@/providers/i18n-provider"

type Gender = "MALE" | "FEMALE" | "UNKNOWN"

type GenderBadgeProps = {
	gender?: Gender | string | null
	className?: string
}

const genderClassMap: Record<Gender, string> = {
	MALE: "bg-tertiary/15 text-tertiary border border-tertiary/40",
	FEMALE: "bg-pink-600/15 text-pink-600 border border-pink-600/40",
	UNKNOWN: "bg-greyscale-700 text-greyscale-100 border border-greyscale-600",
}

const genderLabelMap: Record<"vi" | "en", Record<Gender, string>> = {
	vi: {
		MALE: "Nam",
		FEMALE: "Nữ",
		UNKNOWN: "Chưa xác định",
	},
	en: {
		MALE: "Male",
		FEMALE: "Female",
		UNKNOWN: "Unknown",
	},
}

function normalizeGender(gender?: Gender | string | null): Gender | null {
	if (!gender) return null

	const normalized = String(gender).toUpperCase()

	if (normalized === "MALE") return "MALE"
	if (normalized === "FEMALE") return "FEMALE"
	if (normalized === "UNKNOWN") return "UNKNOWN"

	return null
}

export default function GenderBadge({ gender, className }: GenderBadgeProps) {
	const locale = useLocale()
	const normalizedGender = normalizeGender(gender)

	if (!normalizedGender) {
		return <span className={cn("text-xs text-greyscale-200", className)}>—</span>
	}

	const activeLocale: "vi" | "en" = locale === "en" ? "en" : "vi"

	return (
		<span
			className={cn(
				"shrink-0 rounded px-2 py-1 text-xs font-medium",
				genderClassMap[normalizedGender],
				className,
			)}
		>
			{genderLabelMap[activeLocale][normalizedGender]}
		</span>
	)
}
