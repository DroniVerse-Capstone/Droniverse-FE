"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiBell, FiCheckCircle } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetMyNotifications,
  useGetUnreadNotificationCount,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/hooks/notification/useNotification";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { NotificationItem } from "@/validations/notification/notification";

interface NotificationDropdownProps {
  hasNotifications?: boolean;
}

export default function NotificationDropdown({
  hasNotifications = true,
}: NotificationDropdownProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;

  const notificationsQuery = useGetMyNotifications({
    currentPage: 1,
    pageSize: 5,
    enabled: isAuthenticated,
  });
  const unreadCountQuery = useGetUnreadNotificationCount({ enabled: isAuthenticated });
  const markNotificationAsReadMutation = useMarkNotificationAsRead();
  const markAllNotificationsAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = React.useMemo(() => {
    const items = notificationsQuery.data?.data ?? [];

    return [...items]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 3);
  }, [notificationsQuery.data?.data]);

  const unreadCount = unreadCountQuery.data ?? notifications.filter((item) => item.status !== "READ").length;

  const formatRelativeTime = (value: string) => {
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
  };

  const handleMarkAllAsRead = async () => {
    if (!isAuthenticated) {
      return;
    }

    await markAllNotificationsAsReadMutation.mutateAsync();
  };

  const handleMarkNotificationAsRead = async (notification: NotificationItem) => {
    if (!isAuthenticated) {
      return;
    }

    if (notification.status === "READ") {
      return;
    }

    await markNotificationAsReadMutation.mutateAsync({
      notificationId: notification.notificationID,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-11 w-11 rounded-full text-greyscale-100 hover:bg-greyscale-800 hover:text-greyscale-0"
        >
          <IoNotificationsOutline size={25} />
          {hasNotifications && unreadCount > 0 && (
            <>
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-greyscale-900 bg-red-500" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-greyscale-900 bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-125 w-80 overflow-y-auto border-greyscale-700 bg-greyscale-800"
      >
        <div className="border-b border-greyscale-700 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-greyscale-0">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-primary-200">({unreadCount} mới)</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => void handleMarkAllAsRead()}
                disabled={markAllNotificationsAsReadMutation.isPending}
                className={cn(
                  "text-xs transition-colors",
                  markAllNotificationsAsReadMutation.isPending
                    ? "cursor-not-allowed text-greyscale-500"
                    : "text-primary-200 hover:text-primary-300",
                )}
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
        </div>

        {notificationsQuery.isLoading || unreadCountQuery.isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-greyscale-400">
            Đang tải thông báo...
          </div>
        ) : notifications.length > 0 ? (
          <div className="py-1">
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.notificationID}>
                <DropdownMenuItem
                  onSelect={() => void handleMarkNotificationAsRead(notification)}
                  className={cn(
                    "cursor-pointer px-4 py-3 focus:bg-greyscale-700 hover:bg-greyscale-700",
                    notification.status !== "READ" && "bg-greyscale-750/50",
                  )}
                >
                  <div className="flex w-full gap-3">
                    <div className={cn("mt-1", notification.status !== "READ" ? "text-primary-200" : "text-greyscale-500")}>
                      {notification.status !== "READ" ? (
                        <FiBell className="text-lg" />
                      ) : (
                        <FiCheckCircle className="text-lg" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            notification.status !== "READ"
                              ? "text-greyscale-0"
                              : "text-greyscale-200",
                          )}
                        >
                          {notification.title}
                        </p>
                        {notification.status !== "READ" && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-200" />
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-greyscale-400">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-greyscale-500">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                {index < notifications.length - 1 && (
                  <DropdownMenuSeparator className="bg-greyscale-700" />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : notificationsQuery.isError || unreadCountQuery.isError ? (
          <div className="px-4 py-8 text-center">
            <FiBell className="mx-auto mb-2 text-4xl text-greyscale-500" />
            <p className="text-sm text-greyscale-400">Không thể tải thông báo</p>
          </div>
        ) : (
          <div className="py-8 text-center">
            <FiBell className="mx-auto mb-2 text-4xl text-greyscale-500" />
            <p className="text-sm text-greyscale-400">Không có thông báo mới</p>
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-greyscale-700" />
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                className="w-full text-primary-200 hover:bg-greyscale-700 hover:text-primary-300"
                onClick={() => router.push("/notifications")}
              >
                Xem tất cả
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}