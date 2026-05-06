"use client";

import React from "react";
import { useRouter } from "next/navigation";

import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useGetMyOrders } from "@/hooks/order/useOrder";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale } from "@/providers/i18n-provider";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import { IoMdArrowBack } from "react-icons/io";

const PAGE_SIZE = 10;

export default function OrderHistory() {
  const router = useRouter();
  const locale = useLocale();
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data, isLoading, isError, error } = useGetMyOrders({
    currentPage,
    pageSize: PAGE_SIZE,
  });

  const orders = data?.data ?? [];

  const headers = [
    "STT",
    "Tên khóa học",
    "Số tiền",
    "Trạng thái",
    "Ngày tạo",
    "Ngày xử lý",
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-4 px-6 py-4">
      <div className="flex flex- items-center gap-3">
        <Button variant="outline" icon={<IoMdArrowBack />} onClick={() => router.back()}>
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-greyscale-0">Lịch sử thanh toán</h1>
      </div>
      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : isError ? (
        <p className="text-sm text-error">
          {error.response?.data?.message || error.message || "Không tải được lịch sử thanh toán."}
        </p>
      ) : orders.length === 0 ? (
        <EmptyState title="Chưa có lịch sử thanh toán" description="Các đơn hàng thanh toán sẽ xuất hiện tại đây." />
      ) : (
        <TableCustom
          headers={headers}
          data={orders}
          pagination={
            data
              ? {
                  currentPage: data.pageIndex,
                  pageSize: data.pageSize,
                  totalItems: data.totalRecords,
                  onPageChange: setCurrentPage,
                }
              : undefined
          }
          renderRow={(order, index) => {
            const productName =
              locale === "vi"
                ? order.item?.productNameVN || order.item?.productNameEN || "—"
                : order.item?.productNameEN || order.item?.productNameVN || "—";

            return (
              <>
                <TableCell className="text-greyscale-100">
                  {(data?.pageIndex ? (data.pageIndex - 1) * data.pageSize : 0) + index + 1}
                </TableCell>
                <TableCell className="text-greyscale-0">
                  {productName}
                </TableCell>
                <TableCell className="text-greyscale-0">
                  {formatCurrency(order.totalAmount)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-greyscale-50">
                  {formatDateTime(order.createAt)}
                </TableCell>
                <TableCell className="text-greyscale-100">
                  {order.payment?.transactionDate
                    ? formatDateTime(order.payment.transactionDate)
                    : "—"}
                </TableCell>
              </>
            );
          }}
        />
      )}
    </div>
  );
}
