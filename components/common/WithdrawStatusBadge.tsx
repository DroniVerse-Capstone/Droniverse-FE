import React from "react"

import { WithdrawRequest } from "@/validations/wallet/wallet"
import { useLocale } from "@/providers/i18n-provider"

type WithdrawStatus = WithdrawRequest["status"]

type WithdrawStatusBadgeProps = {
	status: WithdrawStatus
}

const STATUS_MAP: Record<WithdrawStatus, { vi: string; en: string; color: string }> = {
	PENDING: {
		vi: "Chờ duyệt",
		en: "Pending",
		color: "border border-warning/40 bg-warning/15 text-warning",
	},
	APPROVED: {
		vi: "Được duyệt",
		en: "Approved",
		color: "border border-success/40 bg-success/15 text-success",
	},
	REJECTED: {
		vi: "Từ chối",
		en: "Rejected",
		color: "border border-primary/40 bg-primary/15 text-primary",
	},
	CANCELLED: {
		vi: "Huỷ",
		en: "Cancelled",
		color: "border border-greyscale-600 bg-greyscale-800 text-greyscale-100",
	},
}

export default function WithdrawStatusBadge({ status }: WithdrawStatusBadgeProps) {
	const locale = useLocale()
	const statusInfo = STATUS_MAP[status]

	return (
		<span
			className={`inline-block rounded px-2 py-1 text-xs font-medium ${statusInfo.color}`}
		>
			{locale === "vi" ? statusInfo.vi : statusInfo.en}
		</span>
	)
}
