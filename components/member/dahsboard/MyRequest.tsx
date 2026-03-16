"use client";

import React, { useState } from "react";

import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import ClubRequestStatusBadge from "@/components/club/ClubRequestStatusBadge";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { useGetMyClubAttemptRequests } from "@/hooks/club-attempt/useClubAttempt";
import { CLUB_ATTEMPT_REQUEST_STATUS } from "@/lib/constants/club";
import { cn } from "@/lib/utils";
import { formatDateWithTime } from "@/lib/utils/format-date";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";

type RequestStatus = "PENDING" | "APPROVED" | "REJECT" | null;

export default function MyRequest() {
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(null);
  const t = useTranslations("ClubDashboard");
  const locale = useLocale();

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useGetMyClubAttemptRequests({
    status: selectedStatus || undefined,
  });

  const headers = [
    t("table.headers.name"),
    t("table.headers.image"),
    t("table.headers.approver"),
    t("table.headers.createdAt"),
    t("table.headers.processedAt"),
    t("table.headers.status"),
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {error.response?.data?.message ||
            error.message ||
            "Không thể tải danh sách yêu cầu tham gia."}
        </p>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {CLUB_ATTEMPT_REQUEST_STATUS.map((status) => (
            <button
              key={String(status.value)}
              onClick={() =>
                setSelectedStatus(
                  selectedStatus === status.value
                    ? null
                    : (status.value as RequestStatus),
                )
              }
              className={cn(
                "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                selectedStatus === status.value
                  ? "bg-primary text-white"
                  : "bg-greyscale-700 text-greyscale-100 hover:bg-greyscale-600",
              )}
            >
              {t(status.label)}
            </button>
          ))}
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState title={t("empty.title1")} />
      ) : (
        <TableCustom
          headers={headers}
          data={requests}
          renderRow={(req) => (
            <>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium text-greyscale-0">
                    {locale === "vi" ? req.clubNameVN : req.clubNameEN}
                  </p>
                  <p className="text-xs text-greyscale-100">
                    {locale === "vi" ? req.clubNameEN : req.clubNameVN}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <div className="relative h-12 w-18 overflow-hidden rounded border border-greyscale-700">
                  <Image
                    src={req.imageUrl || "/images/club-placeholder.jpg"}
                    alt={req.clubNameVN}
                    fill
                    className="object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="text-sm text-greyscale-50">
                {req.approverName || "—"}
              </TableCell>

              <TableCell className="text-sm text-greyscale-50">
                <div className="leading-tight">
                  <div>{formatDateWithTime(req.createAt).day}</div>
                  <div className="text-xs text-gray-500">
                    {formatDateWithTime(req.createAt).time}
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-sm text-greyscale-50">
                <div className="leading-tight">
                  <div>{formatDateWithTime(req.processedAt).day}</div>
                  <div className="text-xs text-gray-500">
                    {formatDateWithTime(req.processedAt).time}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <ClubRequestStatusBadge
                  status={req.status === "REJECT" ? "REJECTED" : req.status}
                />
              </TableCell>
            </>
          )}
        />
      )}
    </div>
  );
}
