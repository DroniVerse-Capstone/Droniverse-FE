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

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useGetMyClubCreationRequests({
    status: selectedStatus || undefined,
  });

  const headers = [
    "Tên CLB",
    "Chế độ",
    "Ảnh",
    "Ngày tạo",
    "Phê duyệt",
    "Danh mục",
    "Trạng thái",
    "Lý do từ chối",
    "Thao tác",
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
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="Không có yêu cầu nào." />
      ) : (
        <TableCustom
          headers={headers}
          data={requests}
          renderRow={(req, idx) => (
            <>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium text-greyscale-0">{req.nameVN}</p>
                  <p className="text-xs text-greyscale-100">{req.nameEN}</p>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-2 py-1 text-xs border",
                    req.isPublic
                      ? "bg-secondary/15 text-secondary border-secondary/40"
                      : "bg-primary/15 text-primary border-primary/40",
                  )}
                >
                  {req.isPublic ? <CiUnlock size={13} /> : <CiLock size={13} />}
                  {req.isPublic ? "Công khai" : "Riêng tư"}
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
                        {category.typeNameVN}
                      </span>
                    ))}
                    {req.categories.length > 2 && (
                      <span className="text-xs text-greyscale-100">
                        +{req.categories.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-greyscale-100">—</span>
                )}
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
                    <Button
                      className="rounded border border-secondary/40 bg-secondary/15 p-2 text-secondary transition-colors hover:bg-secondary/25"
                      onClick={() => {
                        setEditId(req.clubCreationRequestID);
                        setEditOpen(true);
                      }}
                    >
                      <CiEdit size={18} />
                    </Button>
                    <ConfirmActionPopover
                      trigger={
                        <Button className="rounded border border-error/40 bg-error/15 p-2 text-error transition-colors hover:bg-error/25">
                          <CiTrash size={18} />
                        </Button>
                      }
                      title="Hủy yêu cầu này?"
                      description={
                        <>
                          Hành động này sẽ hủy bỏ yêu cầu tạo câu lạc bộ
                          <span className="font-semibold text-greyscale-25">
                            {req.nameVN}
                          </span>
                          .
                        </>
                      }
                      confirmText="Xác nhận"
                      cancelText="Đóng"
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
                    <Button
                      className="rounded border border-secondary/40 bg-secondary/15 p-2 text-secondary transition-colors hover:bg-secondary/25"
                      onClick={() => setViewId(req.clubCreationRequestID)}
                    >
                      <FaRegEye size={18} />
                    </Button>
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
