"use client"

import React from "react"
import { FaFlagCheckered, FaRegClock, FaUserTie } from "react-icons/fa"
import { FiTarget } from "react-icons/fi"
import { IoPeople } from "react-icons/io5"
import { MdEmojiEvents, MdOutlineTimer } from "react-icons/md"

import CompetitonStatusBadge from "@/components/competition/CompetitonStatusBadge"
import { formatDateTime } from "@/lib/utils/format-date"
import { useLocale, useTranslations } from "@/providers/i18n-provider"
import { Competition } from "@/validations/competitions/competitions"

type ManagerCompetitionCardProps = {
	competition: Competition
}

export default function ManagerCompetitionCard({
	competition,
}: ManagerCompetitionCardProps) {
	const locale = useLocale()
	const t = useTranslations("ManagerCompetitions")

	const title =
		locale === "en"
			? competition.nameEN || competition.nameVN
			: competition.nameVN || competition.nameEN

	const description =
		locale === "en"
			? competition.descriptionEN || competition.descriptionVN
			: competition.descriptionVN || competition.descriptionEN

	return (
		<article className="group overflow-hidden rounded border border-greyscale-700 bg-linear-to-r from-greyscale-800 via-greyscale-700 to-greyscale-900 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-greyscale-500 hover:shadow-md">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0 space-y-1">
					<h3 className="line-clamp-1 text-lg font-semibold text-greyscale-0">
						{title}
					</h3>
					<p className="line-clamp-2 text-sm text-greyscale-100">
						{description || t("fallback.noDescription")}
					</p>
				</div>

				<CompetitonStatusBadge status={competition.status} />
			</div>

			<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
				<div className="rounded border border-greyscale-700 bg-greyscale-800/70 p-2">
					<p className="flex items-center gap-1 text-xs text-greyscale-200">
						<FiTarget size={13} />
						{t("metrics.rounds")}
					</p>
					<p className="mt-1 text-sm font-semibold text-greyscale-0">
						{competition.totalRounds}
					</p>
				</div>

				<div className="rounded border border-greyscale-700 bg-greyscale-800/70 p-2">
					<p className="flex items-center gap-1 text-xs text-greyscale-200">
						<IoPeople size={13} />
						{t("metrics.competitors")}
					</p>
					<p className="mt-1 text-sm font-semibold text-greyscale-0">
						{competition.totalCompetitors}/{competition.maxParticipants}
					</p>
				</div>

				<div className="rounded border border-greyscale-700 bg-greyscale-800/70 p-2">
					<p className="flex items-center gap-1 text-xs text-greyscale-200">
						<MdEmojiEvents size={13} />
						{t("metrics.prizes")}
					</p>
					<p className="mt-1 text-sm font-semibold text-greyscale-0">
						{competition.totalPrizes}
					</p>
				</div>

				<div className="rounded border border-greyscale-700 bg-greyscale-800/70 p-2">
					<p className="flex items-center gap-1 text-xs text-greyscale-200">
						<FaRegClock size={12} />
						{t("metrics.visible")}
					</p>
					<p className="mt-1 text-xs font-medium text-greyscale-50">
						{formatDateTime(competition.visibleAt)}
					</p>
				</div>
			</div>

			<div className="mt-4 space-y-2 rounded border border-greyscale-700 bg-greyscale-800/45 p-3">
				<div className="flex items-start gap-2 text-sm text-greyscale-100">
					<MdOutlineTimer size={15} className="mt-0.5 shrink-0 text-secondary" />
					<div>
						<p className="text-xs uppercase tracking-wide text-greyscale-200">
							{t("timeline.registration")}
						</p>
						<p className="text-greyscale-0">
							{formatDateTime(competition.registrationStartDate)} - {" "}
							{formatDateTime(competition.registrationEndDate)}
						</p>
					</div>
				</div>

				<div className="flex items-start gap-2 text-sm text-greyscale-100">
					<FaFlagCheckered size={14} className="mt-0.5 shrink-0 text-primary" />
					<div>
						<p className="text-xs uppercase tracking-wide text-greyscale-200">
							{t("timeline.competition")}
						</p>
						<p className="text-greyscale-0">
							{formatDateTime(competition.startDate)} - {" "}
							{formatDateTime(competition.endDate)}
						</p>
					</div>
				</div>
			</div>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-greyscale-700 pt-3 text-xs text-greyscale-200">
				<p className="flex items-center gap-1">
					<FaUserTie size={12} />
					{competition.createdBy.fullName}
				</p>
				<p>
					{t("meta.createdAt")}: {" "}
					<span className="text-greyscale-100">
						{formatDateTime(competition.createdAt)}
					</span>
				</p>
			</div>

			{competition.invalidReason && (
				<div className="mt-3 rounded border border-error/45 bg-error/10 p-2 text-xs text-error">
					{t("meta.invalidReason")}: {" "}
					{competition.invalidReason}
				</div>
			)}
		</article>
	)
}
