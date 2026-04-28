"use client";

import React from "react";

import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import { TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useGetMyCommissionTransactions } from "@/hooks/transaction/useTransaction";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale } from "@/providers/i18n-provider";

const PAGE_SIZE = 10;

export default function CommissionHistory() {
  const locale = useLocale();
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data, isLoading, isError, error } = useGetMyCommissionTransactions({
    currentPage,
    pageSize: PAGE_SIZE,
    type: "COMMISSION",
  });

  const transactions = data?.data ?? [];

  const headers = [
    "STT",
    "Tên khóa học",
    "Người mua",
    "Tiền hoa hồng",
    "Ngày nhận",
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-greyscale-0">
        {locale === "vi" ? "Lịch sử hoa hồng" : "Commission History"}
      </h3>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center rounded border border-greyscale-700 bg-greyscale-900/40">
          <Spinner className="h-5 w-5" />
        </div>
      ) : isError ? (
        <div className="rounded border border-greyscale-700 bg-greyscale-900/60 p-4 text-sm text-error">
          {error.response?.data?.message || error.message || 
            (locale === "vi" ? "Không tải được lịch sử hoa hồng." : "Could not load commission history.")}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState 
          title={locale === "vi" ? "Chưa có hoa hồng" : "No Commission Yet"}
          description={locale === "vi" 
            ? "Các giao dịch hoa hồng sẽ xuất hiện tại đây." 
            : "Commission transactions will appear here."
          } 
        />
      ) : (
        <TableCustom
          headers={headers}
          data={transactions}
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
          renderRow={(transaction, index) => {
            const productName =
              locale === "vi"
                ? transaction.order?.item?.productNameVN || transaction.order?.item?.productNameEN || "—"
                : transaction.order?.item?.productNameEN || transaction.order?.item?.productNameVN || "—";

            const username = transaction.order?.user?.username || "—";

            return (
              <>
                <TableCell className="text-greyscale-100">
                  {(data?.pageIndex ? (data.pageIndex - 1) * data.pageSize : 0) + index + 1}
                </TableCell>
                <TableCell className="text-greyscale-0">
                  {productName}
                </TableCell>
                <TableCell className="text-greyscale-0">
                  {username}
                </TableCell>
                <TableCell className="text-greyscale-0">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-greyscale-50">
                  {formatDateTime(transaction.createdAt)}
                </TableCell>
              </>
            );
          }}
        />
      )}
    </div>
  );
}
