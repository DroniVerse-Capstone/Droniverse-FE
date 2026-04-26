"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { useTranslations } from "@/providers/i18n-provider"
import { CompetitionStatus } from "@/validations/competitions/competitions"

const STATUS_STYLES: Record<CompetitionStatus, string> = {
	DRAFT: "border-greyscale-600 bg-greyscale-700/60 text-greyscale-50",
	PUBLISHED: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
	RESULT_PUBLISHED: "border-tertiary/40 bg-tertiary/15 text-tertiary",
	CANCELLED: "border-error/40 bg-error/15 text-error",
	INVALID: "border-error/40 bg-error/15 text-error",
}

type CompetitonStatusBadgeProps = {
	status: CompetitionStatus
	phase?: string
	endDate?: string
	className?: string
}

export default function CompetitonStatusBadge({
	status,
	phase,
	endDate,
	className,
}: CompetitonStatusBadgeProps) {
	const t = useTranslations("ManagerCompetitions")

	const isFinished = 
		phase === "FINISHED" || 
		phase === "COMPLETED" || 
		(endDate && new Date().getTime() > new Date(endDate).getTime());

	if (isFinished && status !== "DRAFT" && status !== "CANCELLED") {
		return (
			<span className={cn(
				"inline-flex shrink-0 items-center rounded border px-2.5 py-1 text-xs font-black uppercase tracking-wider border-greyscale-600 bg-greyscale-700/60 text-greyscale-400 shadow-sm",
				className
			)}>
				Đã kết thúc
			</span>
		)
	}

	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center rounded border px-2.5 py-1 text-xs font-black uppercase tracking-wider shadow-sm",
				STATUS_STYLES[status],
				className
			)}
		>
			{t(`status.${status}`)}
		</span>
	)
}
