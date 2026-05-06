import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import WithdrawStatusBadge from "@/components/common/WithdrawStatusBadge";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import { TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useGetMyWithdrawRequests, useUpdateWithdrawRequestStatus } from "@/hooks/wallet/useWallet";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { GiCancel } from "react-icons/gi";

export default function WithdrawHistory() {
  const locale = useLocale();
  const { data: withdrawRequests = [], isLoading, isError, error } = useGetMyWithdrawRequests();
  const { mutate: updateStatus, isPending } = useUpdateWithdrawRequestStatus();

  const headers = [
    "STT",
    "Số tiền",
    "Ghi chú",
    "Trạng thái",
    "Ngày tạo",
    "Ngày duyệt",
    "Lý do từ chối",
    "Thao tác"
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const handleCancel = (id: string) => {
    updateStatus({
      id,
      data: {
        status: "CANCELLED",
        rejectReason: null,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded border border-greyscale-700 bg-greyscale-900/40">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded border border-greyscale-700 bg-greyscale-900/60 p-4 text-sm text-error">
        {error?.response?.data?.message || error?.message || 
          (locale === "vi" ? "Không tải được lịch sử rút tiền." : "Could not load withdraw history.")}
      </div>
    );
  }

  if (withdrawRequests.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <EmptyState
          title={locale === "vi" ? "Chưa có lịch sử giao dịch" : "No Withdraw History"}
          description={locale === "vi"
            ? "Khi bạn thực hiện rút tiền từ ví, các giao dịch sẽ được liệt kê tại đây để bạn dễ dàng theo dõi."
            : "When you withdraw money from your wallet, transactions will be listed here for you to easily track."
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <TableCustom
        headers={headers}
        data={withdrawRequests}
        renderRow={(request, index) => {
          return (
            <>
              <TableCell className="text-greyscale-100">
                {index + 1}
              </TableCell>
              <TableCell className="text-greyscale-0 font-medium">
                {formatCurrency(request.amount)}
              </TableCell>
              <TableCell className="text-greyscale-0">
                {request.note || "—"}
              </TableCell>
              <TableCell>
                <WithdrawStatusBadge status={request.status} />
              </TableCell>
              <TableCell className="text-greyscale-0">
                {formatDateTime(request.createdAt)}
              </TableCell>
              <TableCell className="text-greyscale-0">
                {request.approvedAt ? formatDateTime(request.approvedAt) : "—"}
              </TableCell>
              <TableCell className="text-greyscale-50">
                {request.rejectReason || "—"}
              </TableCell>
              <TableCell>
                <ConfirmActionPopover
                  trigger={
                    <Button
                      disabled={request.status !== "PENDING" || isPending}
                      icon={<GiCancel size={20}/>}
                      size={"icon"}
                      variant={"deleteIcon"}
                    />
                  }
                  title={locale === "vi" ? "Xác nhận hủy?" : "Confirm cancellation?"}
                  description={locale === "vi" 
                    ? "Bạn có chắc chắn muốn hủy yêu cầu rút tiền này không?"
                    : "Are you sure you want to cancel this withdraw request?"
                  }
                  confirmText={locale === "vi" ? "Hủy" : "Cancel"}
                  cancelText={locale === "vi" ? "Không" : "No"}
                  isLoading={isPending}
                  onConfirm={() => handleCancel(request.withdrawID)}
                  widthClassName="w-64"
                />
              </TableCell>
            </>
          );
        }}
      />
    </div>
  );
}
