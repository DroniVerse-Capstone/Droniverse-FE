"use client";

import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { UserAssignmentAttempt } from "@/validations/assignment/user-assignment";

type AssignmentStatus = UserAssignmentAttempt["status"];

type AssignmentStatusBadgeProps = {
  status: AssignmentStatus;
  className?: string;
};

const STATUS_MAP: Record<
  AssignmentStatus,
  { vi: string; en: string; color: string }
> = {
  SUBMITTED: {
    vi: "Chờ chấm",
    en: "Submitted",
    color: "border border-warning/40 bg-warning/15 text-warning",
  },
  UNDER_REVIEW: {
    vi: "Đang chấm",
    en: "Under review",
    color: "border border-warning/40 bg-warning/15 text-warning",
  },
  PASSED: {
    vi: "Đạt",
    en: "Passed",
    color: "border border-success/40 bg-success/15 text-success",
  },
  FAILED: {
    vi: "Không đạt",
    en: "Failed",
    color: "border border-primary/40 bg-primary/15 text-primary",
  },
};

export default function AssignmentStatusBadge({
  status,
  className,
}: AssignmentStatusBadgeProps) {
  const locale = useLocale();
  const statusInfo = STATUS_MAP[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 rounded px-2 py-1 text-xs font-medium",
        statusInfo.color,
        className,
      )}
    >
      {locale === "vi" ? statusInfo.vi : statusInfo.en}
    </Badge>
  );
}

export type { AssignmentStatus, AssignmentStatusBadgeProps };