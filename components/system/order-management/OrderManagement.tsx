"use client";

import React from "react";
import { AxiosError } from "axios";
import Image from "next/image";
import {
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  RefreshCw,
  XCircle,
} from "lucide-react";

import CommonDropdown, {
  type CommonDropdownOption,
} from "@/components/common/CommonDropdown";
import EmptyState from "@/components/common/EmptyState";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import { TableCustom } from "@/components/common/TableCustom";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { useGetAllClubs } from "@/hooks/club/useClub";
import { useGetOrders } from "@/hooks/order/useOrder";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale } from "@/providers/i18n-provider";
import { ApiError } from "@/types/api/common";
import type { OrderData, OrderOverview } from "@/validations/order/order";

const PAGE_SIZE = 8;

type OrderStatusFilter = "ALL" | "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

const STATUS_OPTIONS: Array<{
  value: OrderStatusFilter;
  labelVi: string;
  labelEn: string;
}> = [
  { value: "ALL", labelVi: "Tất cả", labelEn: "All" },
  { value: "PENDING", labelVi: "Đang xử lý", labelEn: "Pending" },
  { value: "SUCCESS", labelVi: "Thành công", labelEn: "Success" },
  { value: "FAILED", labelVi: "Thất bại", labelEn: "Failed" },
  { value: "CANCELLED", labelVi: "Đã huỷ", labelEn: "Cancelled" },
];

const DEFAULT_OVERVIEW: OrderOverview = {
  totalOrders: 0,
  pendingOrders: 0,
  successOrders: 0,
  failedOrders: 0,
  cancelledOrders: 0,
};

function formatCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatOrderNumber(orderID: string) {
  return `#${orderID.slice(0, 8)}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function OrderManagement() {
  const locale = useLocale();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedStatus, setSelectedStatus] =
    React.useState<OrderStatusFilter>("ALL");
  const [selectedClubId, setSelectedClubId] = React.useState("");

  const { data: clubsData, isLoading: isClubsLoading } = useGetAllClubs({
    currentPage: 1,
    pageSize: 20,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useGetOrders(
    {
      clubId: selectedClubId || undefined,
      status: selectedStatus === "ALL" ? undefined : selectedStatus,
      currentPage,
      pageSize: PAGE_SIZE,
    },
  );

  const clubs = clubsData?.data ?? [];
  const overview = data?.overview ?? DEFAULT_OVERVIEW;
  const ordersPaging = data?.orders;
  const orders = ordersPaging?.data ?? [];

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedClubId]);

  const clubOptions = React.useMemo<CommonDropdownOption[]>(
    () => [
      {
        value: "",
        label: locale === "vi" ? "Tất cả câu lạc bộ" : "All clubs",
      },
      ...clubs.map((club) => ({
        value: club.clubID,
        label: locale === "vi" ? club.nameVN : club.nameEN,
        description: locale === "vi" ? club.nameEN : club.nameVN,
      })),
    ],
    [clubs, locale],
  );

  const overviewCards = [
    {
      icon: <CircleDollarSign />,
      value: overview.totalOrders,
      label: locale === "vi" ? "Tổng đơn" : "Total orders",
    },
    {
      icon: <Clock3 />,
      value: overview.pendingOrders,
      label: locale === "vi" ? "Đang chờ" : "Pending",
    },
    {
      icon: <BadgeCheck />,
      value: overview.successOrders,
      label: locale === "vi" ? "Thành công" : "Success",
    },
    {
      icon: <XCircle />,
      value: overview.failedOrders + overview.cancelledOrders,
      label: locale === "vi" ? "Lỗi / huỷ" : "Failed / cancelled",
    },
  ];

  const headers = [
    "STT",
    locale === "vi" ? "Đơn hàng" : "Order",
    locale === "vi" ? "Người mua" : "Customer",
    locale === "vi" ? "Câu lạc bộ" : "Club",
    locale === "vi" ? "Số tiền" : "Amount",
    locale === "vi" ? "Trạng thái" : "Status",
    locale === "vi" ? "Ngày tạo" : "Created at",
    locale === "vi" ? "Thanh toán" : "Payment",
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
              ? "Đã xảy ra lỗi khi tải dữ liệu."
              : "An error occurred while loading data.")}
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
              <h2 className="text-2xl font-semibold text-greyscale-0">
                {locale === "vi" ? "Quản lý đơn hàng" : "Order management"}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-greyscale-100">
                {locale === "vi"
                  ? "Theo dõi toàn bộ đơn hàng của hệ thống, lọc theo câu lạc bộ và trạng thái để quản lý nhanh hơn."
                  : "Track all system orders, then filter by club and status for faster management."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-greyscale-100 sm:grid-cols-4">
              {overviewCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded border border-white/5 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  <p className="text-[11px] uppercase tracking-wide text-greyscale-300">
                    {card.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-greyscale-0">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm rounded border border-white/5 bg-white/5 p-4 backdrop-blur-sm lg:w-96">
            <CommonDropdown
              value={selectedClubId}
              onChange={(value) => setSelectedClubId(value)}
              options={clubOptions}
              label={locale === "vi" ? "Lọc theo câu lạc bộ" : "Filter by club"}
              placeholder={locale === "vi" ? "Chọn câu lạc bộ" : "Choose club"}
              searchable
              searchPlaceholder={locale === "vi" ? "Tìm tên câu lạc bộ" : "Search club name"}
              searchEmptyMessage={
                locale === "vi" ? "Không tìm thấy câu lạc bộ phù hợp" : "No matching clubs found"
              }
              triggerClassName="mt-0 h-11 border-greyscale-700 bg-greyscale-950/90 text-greyscale-0 hover:bg-greyscale-900"
              contentClassName="border-greyscale-700 bg-greyscale-900"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() =>
              setSelectedStatus((current) =>
                current === status.value ? "ALL" : status.value,
              )
            }
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedStatus === status.value
                ? "bg-primary text-white"
                : "bg-greyscale-700 text-greyscale-100 hover:bg-greyscale-600"
            }`}
          >
            {locale === "vi" ? status.labelVi : status.labelEn}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 rounded border border-greyscale-700 bg-greyscale-900 px-4 py-3 text-sm text-greyscale-100">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-tertiary" />
          {ordersPaging
            ? `${ordersPaging.totalRecords} ${locale === "vi" ? "đơn" : "orders"} • ${locale === "vi" ? "trang" : "page"} ${ordersPaging.pageIndex}/${ordersPaging.totalPages}`
            : locale === "vi"
              ? "Đang tải dữ liệu"
              : "Loading data"}
        </div>
        <Button
          type="button"
          icon={
            <RefreshCw
              className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
          }
          variant="outline"
          onClick={() => refetch()}
        >
          {locale === "vi" ? "Làm mới" : "Refresh"}
        </Button>
      </div>

      <section className="rounded shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
        {orders.length === 0 ? (
          <EmptyState
            title={
              locale === "vi"
                ? "Không có đơn hàng phù hợp"
                : "No matching orders"
            }
            description={
              locale === "vi"
                ? "Thử đổi câu lạc bộ hoặc trạng thái để xem dữ liệu khác."
                : "Try another club or status filter to view different data."
            }
            actionLabel={locale === "vi" ? "Làm mới" : "Refresh"}
            onAction={() => refetch()}
          />
        ) : (
          <TableCustom
            headers={headers}
            data={orders}
            pagination={
              ordersPaging
                ? {
                    currentPage: ordersPaging.pageIndex,
                    pageSize: ordersPaging.pageSize,
                    totalItems: ordersPaging.totalRecords,
                    onPageChange: setCurrentPage,
                  }
                : undefined
            }
            renderRow={(order: OrderData, index) => {
              const productName =
                locale === "vi"
                  ? order.item?.productNameVN ||
                    order.item?.productNameEN ||
                    "—"
                  : order.item?.productNameEN ||
                    order.item?.productNameVN ||
                    "—";
              const customerName = order.user
                ? `${order.user.firstName} ${order.user.lastName}`.trim() ||
                  order.user.username
                : "—";
              const clubName =
                locale === "vi"
                  ? order.club?.nameVN || order.club?.nameEN || "—"
                  : order.club?.nameEN || order.club?.nameVN || "—";

              return (
                <>
                  <TableCell className=" text-greyscale-100">
                    {(ordersPaging?.pageIndex
                      ? (ordersPaging.pageIndex - 1) * ordersPaging.pageSize
                      : 0) +
                      index +
                      1}
                  </TableCell>

                  <TableCell className="">
                    <p className="font-semibold text-greyscale-0">
                      {productName}
                    </p>
                  </TableCell>

                  <TableCell className=" text-greyscale-25">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
                        {order.user?.imageUrl ? (
                          <Image
                            src={order.user.imageUrl}
                            alt={customerName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-greyscale-100">
                            {getInitials(customerName) || "U"}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-greyscale-0">
                          {customerName}
                        </p>
                        <p className="text-xs text-greyscale-100">
                          {order.user?.email || "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className=" text-greyscale-25">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-white/10 bg-white/5">
                        {order.club?.imageUrl ? (
                          <Image
                            src={order.club.imageUrl}
                            alt={clubName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-greyscale-100">
                            {locale === "vi" ? "CLB" : "CL"}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-greyscale-0">{clubName}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className=" text-greyscale-0">
                    {formatCurrency(order.totalAmount, locale)}
                  </TableCell>

                  <TableCell className="">
                    <OrderStatusBadge status={order.status} />
                  </TableCell>

                  <TableCell className=" text-greyscale-100">
                    {formatDateTime(order.createAt)}
                  </TableCell>

                  <TableCell className=" text-greyscale-100">
                    {order.payment?.transactionDate
                      ? formatDateTime(order.payment.transactionDate)
                      : "—"}
                  </TableCell>
                </>
              );
            }}
          />
        )}
      </section>
    </section>
  );
}
