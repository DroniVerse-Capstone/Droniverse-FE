"use client";

import Image from "next/image";
import React, { useState } from "react";
import { CiEdit, CiLock, CiTrash, CiUnlock } from "react-icons/ci";
import EmptyState from "@/components/common/EmptyState";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import {
  useGetClubCreationRequestDetail,
  useGetMyClubCreationRequests,
  useUpdateClubCreationRequestStatus,
} from "@/hooks/club-creation/useClubCreation";
import { cn } from "@/lib/utils";
import { FaRegEye } from "react-icons/fa";
import { CLUB_REQUEST_STATUS } from "@/lib/constants/club";
import { formatDateWithTime } from "@/lib/utils/format-date";
import ClubRequestStatusBadge from "@/components/club/ClubRequestStatusBadge";
import { Button } from "@/components/ui/button";
import { TableCustom } from "@/components/common/TableCustom";
import { ClubRequestDetailModal } from "@/components/club/ClubRequestDetailModal";
import RegisterClubDialog from "@/components/club/RegisterClubDialog";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import TooltipWrapper from "@/components/common/ToolTipWrapper";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCEL" | null;

function canManageRequest(status: RequestStatus) {
  return status === "PENDING";
}

export default function MyRequest() {
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const { data: detail, isLoading: isDetailLoading } =
    useGetClubCreationRequestDetail(viewId ?? undefined);

  const updateStatusMutation = useUpdateClubCreationRequestStatus();
  const t = useTranslations("ClubDashboard");
  const locale = useLocale();

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useGetMyClubCreationRequests({
    status: selectedStatus || undefined,
  });

  const headers = [
    t("table.headers.name"),
    t("table.headers.image"),
    "Drone",
    t("table.headers.createdAt"),
    t("table.headers.approvedAt"),
    t("table.headers.status"),
    t("table.headers.rejectReason"),
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
          renderRow={(req, idx) => (
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
                <div className="relative h-12 w-18 overflow-hidden rounded border border-greyscale-700">
                  <Image
                    src={req.imageUrl || "/images/club-placeholder.jpg"}
                    alt={req.nameVN}
                    fill
                    className="object-cover"
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-greyscale-700">
                    <Image
                      src={
                        req?.drone?.imgURL || "/images/drone-placeholder.jpg"
                      }
                      alt={
                        (locale === "vi"
                          ? req?.drone?.droneNameVN
                          : req?.drone?.droneNameEN) ?? "Drone"
                      }
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-greyscale-0">
                      {locale === "vi"
                        ? req?.drone?.droneNameVN
                        : req?.drone?.droneNameEN}
                    </p>
                    <p className="text-xs text-greyscale-100">
                      {locale === "vi"
                        ? req?.drone?.droneTypeNameVN
                        : req?.drone?.droneTypeNameEN}
                    </p>
                    <p className="text-xs text-greyscale-100">
                      {req?.drone?.manufacturer}
                    </p>
                  </div>
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
                  <div>{formatDateWithTime(req.approvedAt ?? null).day}</div>
                  <div className="text-xs text-gray-500">
                    {formatDateWithTime(req.approvedAt ?? null).time}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <ClubRequestStatusBadge status={req.status} />
              </TableCell>
              <TableCell className="max-w-55">
                {req.rejectReason ? (
                  <p className="line-clamp-2 text-xs text-error">
                    {req.rejectReason}
                  </p>
                ) : (
                  <span className="text-xs text-greyscale-100">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {canManageRequest(req.status) ? (
                  <div className="flex justify-end gap-2">
                    {/* Edit Button */}
                    <TooltipWrapper label={t("table.actions.edit")}>
                      <Button
                        className="rounded border border-secondary/40 bg-secondary/15 p-2 text-secondary transition-colors hover:bg-secondary/25"
                        onClick={() => {
                          setEditId(req.clubCreationRequestID);
                          setEditOpen(true);
                        }}
                      >
                        <CiEdit size={18} />
                      </Button>
                    </TooltipWrapper>

                    {/* Delete Button */}
                    <ConfirmActionPopover
                      trigger={
                        <TooltipWrapper label={t("table.actions.delete")}>
                          <Button className="rounded border border-error/40 bg-error/15 p-2 text-error transition-colors hover:bg-error/25">
                            <CiTrash size={18} />
                          </Button>
                        </TooltipWrapper>
                      }
                      title={t("table.actions.titleDelete")}
                      description={
                        <>
                          {t("table.actions.warnDelete")}
                          <span className="font-semibold text-greyscale-25 ml-1">
                            {req.nameVN}
                          </span>
                          .
                        </>
                      }
                      confirmText={t("table.actions.confirm")}
                      cancelText={t("table.actions.cancel")}
                      isLoading={updateStatusMutation.isPending}
                      onConfirm={() => {
                        updateStatusMutation.mutate({
                          id: req.clubCreationRequestID,
                          data: {
                            status: "CANCEL",
                            rejectReason: null,
                          },
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-end">
                    {/* View Button */}
                    <TooltipWrapper label={t("table.actions.view")}>
                      <Button
                        className="rounded border border-secondary/40 bg-secondary/15 p-2 text-secondary transition-colors hover:bg-secondary/25"
                        onClick={() => setViewId(req.clubCreationRequestID)}
                      >
                        <FaRegEye size={18} />
                      </Button>
                    </TooltipWrapper>
                  </div>
                )}
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
      <RegisterClubDialog
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditId(null);
        }}
        requestId={editId ?? undefined}
        trigger={null}
      />
    </div>
  );
}
