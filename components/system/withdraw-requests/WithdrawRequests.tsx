"use client";

import React from "react";
import toast from "react-hot-toast";

import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import EmptyState from "@/components/common/EmptyState";
import WithdrawStatusBadge from "@/components/common/WithdrawStatusBadge";
import { TableCustom } from "@/components/common/TableCustom";
import {
  useGetWithdrawRequests,
  useUpdateWithdrawRequestStatus,
} from "@/hooks/wallet/useWallet";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale } from "@/providers/i18n-provider";
import { WithdrawRequest } from "@/validations/wallet/wallet";
import { Check, X } from "lucide-react";

const PAGE_SIZE = 5;
const STATUS_OPTIONS = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;
const STATUS_LABELS: Record<
  (typeof STATUS_OPTIONS)[number],
  { vi: string; en: string }
> = {
  PENDING: { vi: "Chờ duyệt", en: "Pending" },
  APPROVED: { vi: "Đã duyệt", en: "Approved" },
  REJECTED: { vi: "Từ chối", en: "Rejected" },
  CANCELLED: { vi: "Đã huỷ", en: "Cancelled" },
};

export default function WithdrawRequests() {
  const locale = useLocale();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedStatus, setSelectedStatus] = React.useState<
    (typeof STATUS_OPTIONS)[number] | null
  >(null);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [selectedRequest, setSelectedRequest] =
    React.useState<WithdrawRequest | null>(null);

  const {
    data: withdrawRequestsData,
    isLoading,
    isError,
    error,
  } = useGetWithdrawRequests({
    currentPage,
    pageSize: PAGE_SIZE,
    status: selectedStatus ?? undefined,
  });

  const { mutate: updateWithdrawRequestStatus, isPending } =
    useUpdateWithdrawRequestStatus();

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  const requests = withdrawRequestsData?.data ?? [];
  const totalRecords = withdrawRequestsData?.totalRecords ?? 0;
  const pageIndex = withdrawRequestsData?.pageIndex ?? currentPage;
  const pageSize = withdrawRequestsData?.pageSize ?? PAGE_SIZE;

  const headers = [
    "STT",
    locale === "vi" ? "Người yêu cầu" : "Requester",
    locale === "vi" ? "Thông tin tài khoản" : "Account Info",
    locale === "vi" ? "Số tiền" : "Amount",
    locale === "vi" ? "Ghi chú" : "Note",
    locale === "vi" ? "Trạng thái" : "Status",
    locale === "vi" ? "Ngày tạo" : "Created At",
    locale === "vi" ? "Ngày duyệt" : "Approved At",
    locale === "vi" ? "Lý do từ chối" : "Reject Reason",
    locale === "vi" ? "Thao tác" : "Actions",
  ];

  const handleApprove = (request: WithdrawRequest) => {
    updateWithdrawRequestStatus(
      {
        id: request.withdrawID,
        data: {
          status: "APPROVED",
          rejectReason: null,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            locale === "vi"
              ? "Đã duyệt yêu cầu rút tiền"
              : "Withdraw request approved",
          );
        },
        onError: (mutationError) => {
          toast.error(
            mutationError.response?.data?.message ||
              (locale === "vi"
                ? "Không thể duyệt yêu cầu"
                : "Failed to approve request"),
          );
        },
      },
    );
  };

  const openRejectDialog = (request: WithdrawRequest) => {
    setSelectedRequest(request);
    setRejectReason("");
    setRejectOpen(true);
  };

  const handleReject = () => {
    if (!selectedRequest) {
      return;
    }

    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      toast.error(
        locale === "vi"
          ? "Vui lòng nhập lý do từ chối"
          : "Please enter a reject reason",
      );
      return;
    }

    updateWithdrawRequestStatus(
      {
        id: selectedRequest.withdrawID,
        data: {
          status: "REJECTED",
          rejectReason: trimmedReason,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            locale === "vi"
              ? "Đã từ chối yêu cầu rút tiền"
              : "Withdraw request rejected",
          );
          setRejectOpen(false);
          setSelectedRequest(null);
          setRejectReason("");
        },
        onError: (mutationError) => {
          toast.error(
            mutationError.response?.data?.message ||
              (locale === "vi"
                ? "Không thể từ chối yêu cầu"
                : "Failed to reject request"),
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-greyscale-500 border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {error.response?.data?.message ||
            error.message ||
            (locale === "vi"
              ? "Không thể tải danh sách yêu cầu rút tiền."
              : "Failed to load withdraw requests.")}
        </p>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedStatus(null)}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedStatus === null
              ? "bg-primary text-white"
              : "bg-greyscale-700 text-greyscale-100 hover:bg-greyscale-600"
          }`}
        >
          {locale === "vi" ? "Tất cả" : "All"}
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() =>
              setSelectedStatus((current) =>
                current === status ? null : status,
              )
            }
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedStatus === status
                ? "bg-primary text-white"
                : "bg-greyscale-700 text-greyscale-100 hover:bg-greyscale-600"
            }`}
          >
            {locale === "vi"
              ? STATUS_LABELS[status].vi
              : STATUS_LABELS[status].en}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title={
            locale === "vi"
              ? "Chưa có yêu cầu rút tiền"
              : "No withdraw requests found"
          }
        />
      ) : (
        <TableCustom
          headers={headers}
          data={requests}
          pagination={{
            currentPage: pageIndex,
            pageSize,
            totalItems: totalRecords,
            onPageChange: setCurrentPage,
          }}
          renderRow={(request, index) => (
            <>
              <TableCell className="text-greyscale-100">
                {(pageIndex - 1) * pageSize + index + 1}
              </TableCell>

              <TableCell className="text-greyscale-50">
                {request.wallet?.ownerName || "—"}
              </TableCell>

              <TableCell className="text-greyscale-50">
                <div className="space-y-1">
                  <p className="font-medium text-greyscale-0">
                    {request.wallet?.bank || "—"}
                  </p>
                  <p className="text-xs text-greyscale-100">
                    {request.wallet?.bankNumber || "—"}
                  </p>
                </div>
              </TableCell>

              <TableCell className="text-greyscale-0">
                {request.amount.toLocaleString(
                  locale === "vi" ? "vi-VN" : "en-US",
                )}
              </TableCell>

              <TableCell className="max-w-80 text-greyscale-50">
                <p className="line-clamp-2 wrap-break-word">
                  {request.note || "—"}
                </p>
              </TableCell>

              <TableCell>
                <WithdrawStatusBadge status={request.status} />
              </TableCell>

              <TableCell className="text-greyscale-100">
                {formatDateTime(request.createdAt)}
              </TableCell>

              <TableCell className="text-greyscale-100">
                {formatDateTime(request.approvedAt)}
              </TableCell>

              <TableCell className="max-w-72 text-greyscale-50">
                <p className="line-clamp-2 wrap-break-word">
                  {request.rejectReason || "—"}
                </p>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <ConfirmActionPopover
                    trigger={
                      <Button
                        type="button"
                        size="icon"
                        variant="secondaryIcon"
                        disabled={isPending || request.status !== "PENDING"}
                      >
                        <Check size={16} />
                      </Button>
                    }
                    title={
                      locale === "vi"
                        ? "Xác nhận duyệt yêu cầu rút tiền?"
                        : "Confirm approve withdraw request?"
                    }
                    description={
                      locale === "vi"
                        ? `Duyệt yêu cầu ${request.amount.toLocaleString("vi-VN")}đ của ${request.wallet?.ownerName || "người dùng"}.`
                        : `Approve ${request.amount.toLocaleString("en-US")} VND request from ${request.wallet?.ownerName || "user"}.`
                    }
                    confirmText={locale === "vi" ? "Duyệt" : "Approve"}
                    cancelText={locale === "vi" ? "Đóng" : "Close"}
                    isLoading={isPending}
                    onConfirm={() => handleApprove(request)}
                  />

                  <Button
                    type="button"
                    size="icon"
                    variant="deleteIcon"
                    disabled={isPending || request.status !== "PENDING"}
                    onClick={() => openRejectDialog(request)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </TableCell>
            </>
          )}
        />
      )}

      <Dialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) {
            setSelectedRequest(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {locale === "vi"
                ? "Từ chối yêu cầu rút tiền"
                : "Reject withdraw request"}
            </DialogTitle>
            <DialogDescription>
              {locale === "vi"
                ? "Nhập lý do từ chối trước khi xác nhận."
                : "Enter a reason before confirming rejection."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={
                locale === "vi" ? "Nhập lý do từ chối" : "Enter reject reason"
              }
              rows={4}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={isPending}
            >
              {locale === "vi" ? "Huỷ" : "Cancel"}
            </Button>
            <Button type="button" onClick={handleReject} disabled={isPending}>
              {isPending
                ? locale === "vi"
                  ? "Đang xử lý..."
                  : "Processing..."
                : locale === "vi"
                  ? "Xác nhận từ chối"
                  : "Confirm reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
