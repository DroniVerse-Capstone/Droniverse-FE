"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { useTranslations } from "@/providers/i18n-provider"
import { CompetitionStatus } from "@/validations/competitions/competitions"

const STATUS_STYLES: Record<CompetitionStatus, string> = {
	DRAFT: "border-greyscale-600 bg-greyscale-700/60 text-greyscale-50",
	PUBLISHED: "border-primary/40 bg-primary/15 text-primary",
	REGISTRATION_OPEN: "border-secondary/40 bg-secondary/15 text-secondary",
	REGISTRATION_CLOSED: "border-warning/40 bg-warning/15 text-warning",
	ONGOING: "border-info/40 bg-info/15 text-info",
	FINISHED: "border-success/40 bg-success/15 text-success",
	RESULT_PUBLISHED: "border-tertiary/40 bg-tertiary/15 text-tertiary",
	CANCELLED: "border-error/40 bg-error/15 text-error",
	INVALID: "border-error/40 bg-error/15 text-error",
}

type CompetitonStatusBadgeProps = {
	status: CompetitionStatus
	className?: string
}

export default function CompetitonStatusBadge({
	status,
	className,
}: CompetitonStatusBadgeProps) {
	const t = useTranslations("ManagerCompetitions")

	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center rounded border px-2.5 py-1 text-xs font-medium",
				STATUS_STYLES[status],
				className
			)}
		>
			{t(`status.${status}`)}
		</span>
	)
}
