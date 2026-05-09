"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCheck, Bell, Loader2 } from "lucide-react";

import AppPagination from "@/components/common/AppPagination";
import { Button } from "@/components/ui/button";
import {
  useGetMyNotifications,
  useGetUnreadNotificationCount,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/hooks/notification/useNotification";
import { cn } from "@/lib/utils";
import { NotificationItem } from "@/validations/notification/notification";
import { useLocale } from "@/providers/i18n-provider";

const PAGE_SIZE = 10;

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const formatter = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  return formatter.format(diffDays, "day");
}

function getStatusLabel(status: NotificationItem["status"]) {
  switch (status) {
    case "READ":
      return "Đã đọc";
    case "SENT":
      return "Đã gửi";
    case "FAILED":
      return "Thất bại";
    default:
      return "Đang chờ";
  }
}

export default function Notification() {
  const locale = useLocale();
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);

  const notificationsQuery = useGetMyNotifications({
    currentPage,
    pageSize: PAGE_SIZE,
  });
  const unreadCountQuery = useGetUnreadNotificationCount();
  const markNotificationAsReadMutation = useMarkNotificationAsRead();
  const markAllNotificationsAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = notificationsQuery.data?.data ?? [];
  const pageIndex = notificationsQuery.data?.pageIndex ?? currentPage;
  const totalPages = notificationsQuery.data?.totalPages ?? 0;
  const totalRecords = notificationsQuery.data?.totalRecords ?? 0;
  const unreadCount =
    unreadCountQuery.data ??
    notifications.filter((notification) => notification.status !== "READ").length;

  const handleMarkNotificationAsRead = async (notification: NotificationItem) => {
    if (notification.status === "READ") {
      return;
    }

    await markNotificationAsReadMutation.mutateAsync({
      notificationId: notification.notificationID,
    });
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsReadMutation.mutateAsync();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-greyscale-900 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded border border-greyscale-700 bg-greyscale-800/80 p-5 shadow-xl backdrop-blur md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-11 w-11 rounded-full border-greyscale-700 bg-greyscale-900 text-greyscale-0 hover:bg-greyscale-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div>
              <h1 className="mt-1 text-2xl font-semibold text-greyscale-0 md:text-3xl">
                {locale === "vi" ? "Thông báo của bạn" : "Your Notifications"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-greyscale-300">
                {locale === "vi"
                  ? "Xem các thông báo mới nhất, đánh dấu đã đọc từng mục hoặc xử lý tất cả cùng lúc."
                  : "View the latest notifications, mark each as read, or process them all at once."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => void handleMarkAllAsRead()}
              disabled={markAllNotificationsAsReadMutation.isPending || unreadCount === 0}
              className={cn(
                "h-11 px-5",
                unreadCount === 0 && "pointer-events-none opacity-60",
              )}
            >
              {markAllNotificationsAsReadMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              {locale === "vi" ? "Đánh dấu tất cả đã đọc" : "Mark all as read"}
            </Button>
          </div>
        </div>

        {notificationsQuery.isLoading || unreadCountQuery.isLoading ? (
          <div className="rounded-3xl border border-greyscale-800 bg-greyscale-850/70 shadow-xl">
            <div className="flex min-h-80 items-center justify-center py-16 text-greyscale-300">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary-200" />
                {locale === "vi" ? "Đang tải thông báo..." : "Loading notifications..."}
              </div>
            </div>
          </div>
        ) : notificationsQuery.isError || unreadCountQuery.isError ? (
          <div className="rounded-3xl border border-greyscale-800 bg-greyscale-850/70 shadow-xl">
            <div className="flex min-h-80 flex-col items-center justify-center py-16 text-center">
              <Bell className="mb-4 h-12 w-12 text-greyscale-500" />
              <h2 className="text-lg font-medium text-greyscale-0">
                {locale === "vi" ? "Không thể tải thông báo" : "Cannot load notifications"}
              </h2>
              <p className="mt-2 max-w-md text-sm text-greyscale-400">
                {locale === "vi"
                  ? "Hệ thống không thể lấy dữ liệu thông báo lúc này. Vui lòng thử lại sau."
                  : "The system cannot fetch notification data at the moment. Please try again later."}
              </p>
              <Button className="mt-6" onClick={() => notificationsQuery.refetch()}>
                {locale === "vi" ? "Thử lại" : "Try again"}
              </Button>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-greyscale-800 bg-greyscale-850/70 shadow-xl">
            <div className="flex min-h-80 flex-col items-center justify-center py-16 text-center">
              <Bell className="mb-4 h-12 w-12 text-greyscale-500" />
              <h2 className="text-lg font-medium text-greyscale-0">
                {locale === "vi" ? "Không có thông báo" : "No notifications"}
              </h2>
              <p className="mt-2 max-w-md text-sm text-greyscale-400">
                {locale === "vi"
                  ? "Bạn chưa có thông báo nào ở trang hiện tại."
                  : "You don't have any notifications at the moment."}
              </p>
              <Button className="mt-6" variant="outline" onClick={() => router.back()}>
                {locale === "vi" ? "Quay lại" : "Go back"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const isRead = notification.status === "READ";

              return (
                <div
                  key={notification.notificationID}
                  className={cn(
                    "overflow-hidden rounded border border-greyscale-700 bg-greyscale-800/70 shadow-xl transition-all hover:border-greyscale-700 hover:bg-greyscale-900",
                    !isRead && "ring-1 ring-primary-500/20",
                  )}
                >
                  <div className="flex flex-row items-start justify-between gap-4 border-b border-greyscale-600 px-5 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex h-2.5 w-2.5 rounded-full",
                            isRead ? "bg-greyscale-600" : "bg-primary-200",
                          )}
                        />
                        <h3 className="truncate text-base font-semibold text-greyscale-0">
                          {notification.title}
                        </h3>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-greyscale-400">
                        <span>{formatRelativeTime(notification.createdAt)}</span>
                        <span className="h-1 w-1 rounded-full bg-greyscale-600" />
                        <span>{getStatusLabel(notification.status)}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isRead ? "outline" : "default"}
                      onClick={() => void handleMarkNotificationAsRead(notification)}
                      disabled={isRead || markNotificationAsReadMutation.isPending}
                      className="shrink-0"
                    >
                      {isRead ? (locale === "vi" ? "Đã đọc" : "Read") : (locale === "vi" ? "Đánh dấu đã đọc" : "Mark as read")}
                    </Button>

                  </div>

                  <div className="px-5 py-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-greyscale-100">
                      {notification.message}
                    </p>

                    {notification.errorMessage && (
                      <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {notification.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex flex-col items-center gap-4 rounded border border-greyscale-700 bg-greyscale-800/70 px-5 py-5 md:flex-row md:justify-between">
              <div className="text-sm text-greyscale-300">
                 { locale === "vi" ? "Đang xem trang" : "Viewing page" } <span className="font-medium text-greyscale-0">{pageIndex}</span> { locale === "vi" ? "trên" : "of" } <span className="font-medium text-greyscale-0">{totalPages || 1}</span>.
              </div>
              <AppPagination
                currentPage={pageIndex}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                disabled={notificationsQuery.isFetching}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
