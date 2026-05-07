"use client";

import React from "react";
import Image from "next/image";
import { AxiosError } from "axios";
import { BadgeDollarSign, RefreshCw } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import CommonDatePicker from "@/components/common/CommonDatePicker";
import { TableCustom } from "@/components/common/TableCustom";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { useGetCommissionTransactions } from "@/hooks/transaction/useTransaction";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale } from "@/providers/i18n-provider";
import { ApiError } from "@/types/api/common";
import type { Transaction } from "@/validations/transaction/transaction";

const PAGE_SIZE = 10;

function formatCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortId(value?: string | null) {
  if (!value) {
    return "—";
  }

  return `#${value.slice(0, 8)}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function CommissionManagement() {
  const locale = useLocale();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [draftCreatedFrom, setDraftCreatedFrom] = React.useState("");
  const [draftCreatedTo, setDraftCreatedTo] = React.useState("");
  const [createdFrom, setCreatedFrom] = React.useState("");
  const [createdTo, setCreatedTo] = React.useState("");

  const applyFilters = () => {
    setCreatedFrom(draftCreatedFrom);
    setCreatedTo(draftCreatedTo);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setDraftCreatedFrom("");
    setDraftCreatedTo("");
    setCreatedFrom("");
    setCreatedTo("");
    setCurrentPage(1);
  };

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetCommissionTransactions({
      currentPage,
      pageSize: PAGE_SIZE,
      type: "COMMISSION",
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
    });

  const transactions = data?.data ?? [];
  const headers = [
    "STT",
    locale === "vi" ? "Ví hoa hồng" : "Commission wallet",
    locale === "vi" ? "Người mua" : "Buyer",
    locale === "vi" ? "Câu lạc bộ" : "Club",
    locale === "vi" ? "Đơn hàng" : "Order",
    locale === "vi" ? "Hoa hồng" : "Commission",
    locale === "vi" ? "Ngày tạo" : "Created at",
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isError) {
    const axiosError = error as AxiosError<ApiError>;

    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {axiosError.response?.data?.message ||
            axiosError.message ||
            (locale === "vi"
              ? "Không thể tải danh sách hoa hồng."
              : "Unable to load commission transactions.")}
        </p>
      </Empty>
    );
  }

  return (
    <section className="space-y-5">
      <header className="overflow-hidden rounded border border-greyscale-700 bg-linear-to-br from-greyscale-900 via-greyscale-900 to-greyscale-950 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-primary-200">
                <BadgeDollarSign className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {locale === "vi" ? "Quản lý hoa hồng" : "Commission management"}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-greyscale-0">
                {locale === "vi" ? "Danh sách hoa hồng hệ thống" : "System commission list"}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-greyscale-100">
                {locale === "vi"
                  ? "Theo dõi toàn bộ giao dịch hoa hồng, lọc theo khoảng ngày và xem nhanh câu lạc bộ, người mua và đơn hàng liên quan."
                  : "Track every commission transaction, filter by date range, and review the related club, buyer, and order at a glance."}
              </p>
            </div>
          </div>

          <div className="w-full max-w-xl rounded border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-greyscale-300">
                    {locale === "vi" ? "Lọc theo ngày" : "Date filters"}
                  </p>
                  <p className="mt-1 text-sm text-greyscale-100">
                    {locale === "vi"
                      ? "Chọn khoảng thời gian để thu hẹp danh sách giao dịch."
                      : "Pick a date range to narrow down the transaction list."}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!draftCreatedFrom && !draftCreatedTo}
                  onClick={resetFilters}
                >
                  {locale === "vi" ? "Xoá lọc" : "Clear filters"}
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <CommonDatePicker
                  value={draftCreatedFrom}
                  onChange={setDraftCreatedFrom}
                  placeholder={locale === "vi" ? "Từ ngày" : "From date"}
                  triggerClassName="mt-0 border-greyscale-700 bg-greyscale-950/90 text-greyscale-0 hover:bg-greyscale-900"
                  className="space-y-1.5"
                />
                <CommonDatePicker
                  value={draftCreatedTo}
                  onChange={setDraftCreatedTo}
                  placeholder={locale === "vi" ? "Đến ngày" : "To date"}
                  triggerClassName="mt-0 border-greyscale-700 bg-greyscale-950/90 text-greyscale-0 hover:bg-greyscale-900"
                  className="space-y-1.5"
                />
                <Button
                  type="button"
                  className="self-end"
                  onClick={applyFilters}
                  disabled={!draftCreatedFrom || !draftCreatedTo}
                >
                  {locale === "vi" ? "Lọc" : "Filter"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between gap-3 rounded border border-greyscale-700 bg-greyscale-900 px-4 py-3 text-sm text-greyscale-100">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-tertiary" />
          {data
            ? `${data.totalRecords} ${locale === "vi" ? "giao dịch" : "transactions"} • ${locale === "vi" ? "trang" : "page"} ${data.pageIndex}/${data.totalPages}`
            : locale === "vi"
              ? "Đang tải dữ liệu"
              : "Loading data"}
        </div>
        <Button
          type="button"
          icon={
            <RefreshCw className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          }
          variant="outline"
          onClick={() => refetch()}
        >
          {locale === "vi" ? "Làm mới" : "Refresh"}
        </Button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          title={
            locale === "vi"
              ? "Không có giao dịch hoa hồng"
              : "No commission transactions"
          }
          description={
            locale === "vi"
              ? "Thử đổi khoảng ngày hoặc làm mới để xem dữ liệu khác."
              : "Try another date range or refresh to load different data."
          }
          actionLabel={locale === "vi" ? "Xoá bộ lọc" : "Clear filters"}
          onAction={resetFilters}
        />
      ) : (
        <TableCustom
          headers={headers}
          data={transactions}
          pagination={{
            currentPage: data?.pageIndex ?? currentPage,
            pageSize: data?.pageSize ?? PAGE_SIZE,
            totalItems: data?.totalRecords ?? 0,
            onPageChange: setCurrentPage,
          }}
          renderRow={(transaction: Transaction, index) => {
            const buyerName =
              transaction.order?.user?.username ||
              [transaction.order?.user?.firstName, transaction.order?.user?.lastName]
                .filter(Boolean)
                .join(" ") ||
              "—";

            const productName =
              locale === "vi"
                ? transaction.order?.item?.productNameVN ||
                  transaction.order?.item?.productNameEN ||
                  "—"
                : transaction.order?.item?.productNameEN ||
                  transaction.order?.item?.productNameVN ||
                  "—";

            const clubName =
              locale === "vi"
                ? transaction.club?.nameVN || transaction.club?.nameEN || "—"
                : transaction.club?.nameEN || transaction.club?.nameVN || "—";

            const walletOwner = transaction.wallet?.ownerName || "—";
            const walletBank =
              transaction.wallet?.bank && transaction.wallet?.bankNumber
                ? `${transaction.wallet.bank} • ${transaction.wallet.bankNumber}`
                : transaction.wallet?.bank || transaction.wallet?.bankNumber || "—";

            return (
              <>
                <TableCell className="text-greyscale-100">
                  {(data?.pageIndex ? (data.pageIndex - 1) * data.pageSize : 0) +
                    index +
                    1}
                </TableCell>

                <TableCell className="text-greyscale-25">
                  <div className="space-y-1">
                    <p className="font-medium text-greyscale-0">{walletOwner}</p>
                    <p className="text-xs text-greyscale-100">{walletBank}</p>
                  </div>
                </TableCell>

                  <TableCell className="text-greyscale-25">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
                        {transaction.order?.user?.imageUrl ? (
                          <Image
                            src={transaction.order.user.imageUrl}
                            alt={buyerName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-greyscale-100">
                            {getInitials(buyerName) || "U"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-medium text-greyscale-0">{buyerName}</p>
                        <p className="truncate text-xs text-greyscale-100">
                          {transaction.order?.user?.email || "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                <TableCell className="text-greyscale-25">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-white/10 bg-white/5">
                      {transaction.club?.imageUrl ? (
                        <Image
                          src={transaction.club.imageUrl}
                          alt={clubName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-greyscale-100">
                          {getInitials(clubName) || "CL"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-greyscale-0">{clubName}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-greyscale-25">
                  <div className="space-y-1">
                    <p className="font-medium text-greyscale-0">{productName}</p>
                    <p className="text-xs text-greyscale-100">{buyerName}</p>
                  </div>
                </TableCell>

                <TableCell className="text-greyscale-0">
                  {formatCurrency(transaction.amount, locale)}
                </TableCell>

                <TableCell className="text-greyscale-100">
                  {formatDateTime(transaction.createdAt)}
                </TableCell>
              </>
            );
          }}
        />
      )}
    </section>
  );
}
