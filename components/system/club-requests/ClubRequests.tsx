"use client";

import Image from "next/image";
import React, { useState } from "react";

import { TableCustom } from "@/components/common/TableCustom";
import EmptyState from "@/components/common/EmptyState";
import ClubRequestStatusBadge from "@/components/club/ClubRequestStatusBadge";
import { ClubRequestDetailModal } from "@/components/club/ClubRequestDetailModal";
import TooltipWrapper from "@/components/common/ToolTipWrapper";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import {
  useGetAllClubCreationRequests,
  useGetClubCreationRequestDetail,
} from "@/hooks/club-creation/useClubCreation";
import { CLUB_REQUEST_STATUS } from "@/lib/constants/club";
import { cn } from "@/lib/utils";
import { formatDateWithTime } from "@/lib/utils/format-date";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { FaRegEye } from "react-icons/fa";
import { CiLock, CiUnlock } from "react-icons/ci";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCEL" | null;

const PAGE_SIZE = 8;

export default function ClubRequests() {
  const t = useTranslations("ClubDashboard");
  const locale = useLocale();
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);

  const { data: detail, isLoading: isDetailLoading } =
    useGetClubCreationRequestDetail(viewId ?? undefined);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetAllClubCreationRequests({
    status: selectedStatus || undefined,
    currentPage,
    pageSize: PAGE_SIZE,
  });

  const requests = data?.data ?? [];

  const headers = [
    t("table.headers.name"),
    t("table.headers.requester"),
    t("table.headers.mode"),
    t("table.headers.image"),
    t("table.headers.createdAt"),
    t("table.headers.approvedAt"),
    t("table.headers.category"),
    t("table.headers.status"),
    t("table.headers.actions"),
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
            "Không thể tải danh sách yêu cầu."}
        </p>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {CLUB_REQUEST_STATUS.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                const nextStatus =
                  selectedStatus === status.value
                    ? null
                    : (status.value as RequestStatus);
                setSelectedStatus(nextStatus);
                setCurrentPage(1);
              }}
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
          pagination={{
            currentPage: data?.pageIndex ?? currentPage,
            pageSize: data?.pageSize ?? PAGE_SIZE,
            totalItems: data?.totalRecords ?? 0,
            onPageChange: setCurrentPage,
          }}
          renderRow={(req) => (
            <>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium text-greyscale-0">
                    {locale === "vi" ? req.nameVN : req.nameEN}
                  </p>
                  <p className="text-xs text-greyscale-100">
                    {locale === "vi" ? req.nameEN : req.nameVN}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-greyscale-50">
                  <div className="font-medium text-greyscale-25">{req.requesterName}</div>
                  <div className="text-xs text-greyscale-100">{req.requesterEmail}</div>
                </div>
              </TableCell>

              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded border px-2 py-1 text-xs",
                    req.isPublic
                      ? "border-secondary/40 bg-secondary/15 text-secondary"
                      : "border-primary/40 bg-primary/15 text-primary",
                  )}
                >
                  {req.isPublic ? <CiUnlock size={13} /> : <CiLock size={13} />}
                  {req.isPublic ? t("privacy.public") : t("privacy.private")}
                </span>
              </TableCell>

              <TableCell>
                <div className="relative h-12 w-18 overflow-hidden rounded border border-greyscale-700">
                  <Image
                    src={req.imageUrl || "/images/club-placeholder.jpg"}
                    alt={req.nameVN}
                    fill
                    className="object-cover"
                  />
                </div>
              </TableCell>

              <TableCell className="text-sm text-greyscale-50">
                <div className="leading-tight">
                  <div>{formatDateWithTime(req.createdAt).day}</div>
                  <div className="text-xs text-gray-500">
                    {formatDateWithTime(req.createdAt).time}
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-sm text-greyscale-50">
                <div className="leading-tight">
                  <div>{formatDateWithTime(req.approvedAt).day}</div>
                  <div className="text-xs text-gray-500">
                    {formatDateWithTime(req.approvedAt).time}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {req.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {req.categories.slice(0, 2).map((category) => (
                      <span
                        key={category.categoryId}
                        className="rounded border border-greyscale-600 px-2 py-0.5 text-xs text-greyscale-100"
                      >
                        {locale === "vi" ? category.typeNameVN : category.typeNameEN}
                      </span>
                    ))}
                    {req.categories.length > 2 && (
                      <span className="text-xs text-greyscale-100">
                        +{req.categories.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-greyscale-100">-</span>
                )}
              </TableCell>

              <TableCell>
                <ClubRequestStatusBadge status={req.status} />
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end">
                  <TooltipWrapper label={t("table.actions.view")}>
                    <Button
                      className="rounded border border-secondary/40 bg-secondary/15 p-2 text-secondary transition-colors hover:bg-secondary/25"
                      onClick={() => setViewId(req.clubCreationRequestID)}
                    >
                      <FaRegEye size={18} />
                    </Button>
                  </TooltipWrapper>
                </div>
              </TableCell>
            </>
          )}
        />
      )}

      <ClubRequestDetailModal
        open={!!viewId}
        onOpenChange={() => setViewId(null)}
        isLoading={isDetailLoading}
        detail={detail}
      />
    </div>
  );
}
