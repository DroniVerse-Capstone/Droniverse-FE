"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OrderStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

type OrderStatusBadgeProps = {
	status: OrderStatus | string;
	className?: string;
};

const statusClassMap: Record<string, string> = {
	PENDING: "border border-warning/40 bg-warning/15 text-warning",
	SUCCESS: "border border-success/40 bg-success/15 text-success",
	FAILED: "border border-destructive/40 bg-destructive/15 text-destructive",
	CANCELLED: "border border-greyscale-600 bg-greyscale-800 text-greyscale-100",
};

const statusLabelMap: Record<string, string> = {
	PENDING: "Đang xử lý",
	SUCCESS: "Thành công",
	FAILED: "Thất bại",
	CANCELLED: "Đã hủy",
};

export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
	const normalizedStatus = status.toUpperCase();

	return (
		<Badge
			variant="outline"
			className={cn(
				"shrink-0 rounded px-2 py-1 text-xs font-medium",
				statusClassMap[normalizedStatus] ?? "border border-greyscale-600 bg-greyscale-800 text-greyscale-100",
				className,
			)}
		>
			{statusLabelMap[normalizedStatus] ?? normalizedStatus}
		</Badge>
	);
}

export type { OrderStatus, OrderStatusBadgeProps };
