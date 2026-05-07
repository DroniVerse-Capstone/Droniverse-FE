"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/i18n-provider";

type OrderStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

type OrderStatusBadgeProps = {
	status: OrderStatus | string;
	className?: string;
};

const statusClassMap: Record<string, string> = {
	PENDING: "border border-warning/40 bg-warning/15 text-warning",
	SUCCESS: "border border-success/40 bg-success/15 text-success",
	FAILED: "border border-primary/40 bg-primary/15 text-primary",
	CANCELLED: "border border-greyscale-600 bg-greyscale-800 text-greyscale-100",
};

const statusLabelMap: Record<string, { vi: string; en: string }> = {
	PENDING: {
		vi: "Đang xử lý",
		en: "Pending",
	},
	SUCCESS: {
		vi: "Thành công",
		en: "Success",
	},
	FAILED: {
		vi: "Thất bại",
		en: "Failed",
	},
	CANCELLED: {
		vi: "Đã hủy",
		en: "Cancelled",
	},
};

export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
	const locale = useLocale();
	const normalizedStatus = status.toUpperCase();
	const statusLabel = statusLabelMap[normalizedStatus];

	return (
		<Badge
			variant="outline"
			className={cn(
				"shrink-0 rounded px-2 py-1 text-xs font-medium",
				statusClassMap[normalizedStatus] ?? "border border-greyscale-600 bg-greyscale-800 text-greyscale-100",
				className,
			)}
		>
			{statusLabel?.[locale === "vi" ? "vi" : "en"] ?? normalizedStatus}
		</Badge>
	);
}

export type { OrderStatus, OrderStatusBadgeProps };
