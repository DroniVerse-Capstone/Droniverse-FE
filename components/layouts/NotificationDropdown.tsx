"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { IoNotificationsOutline } from 'react-icons/io5';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationDropdownProps {
  hasNotifications?: boolean;
  notifications?: Notification[];
  onMarkAllAsRead?: () => void;
}

export default function NotificationDropdown({ 
  hasNotifications = true,
  notifications = [],
  onMarkAllAsRead 
}: NotificationDropdownProps) {
  const router = useRouter();

  // Mock data for demonstration
  const mockNotifications: Notification[] = notifications.length > 0 ? notifications : [
    {
      id: '1',
      title: 'Bài tập mới',
      message: 'Bạn có một bài tập mới cần hoàn thành',
      time: '5 phút trước',
      isRead: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Thông báo hệ thống',
      message: 'Hệ thống sẽ bảo trì vào 2h sáng mai',
      time: '1 giờ trước',
      isRead: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'Hoàn thành khóa học',
      message: 'Chúc mừng bạn đã hoàn thành khóa học Drone cơ bản',
      time: '2 giờ trước',
      isRead: true,
      type: 'success'
    },
  ];

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full w-11 h-11 text-greyscale-100 hover:text-greyscale-0 hover:bg-greyscale-800"
        >
          <IoNotificationsOutline size={25} />
          {hasNotifications && unreadCount > 0 && (
            <>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-greyscale-900" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-greyscale-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-greyscale-800 border-greyscale-700 max-h-[500px] overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-greyscale-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-greyscale-0">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-primary-200">
                  ({unreadCount} mới)
                </span>
              )}
            </h3>
            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-primary-200 hover:text-primary-300 transition-colors"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {mockNotifications.length > 0 ? (
          <div className="py-1">
            {mockNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <DropdownMenuItem
                  onClick={() => router.push(`/notifications/${notification.id}`)}
                  className={`cursor-pointer px-4 py-3 focus:bg-greyscale-700 hover:bg-greyscale-700 ${
                    !notification.isRead ? 'bg-greyscale-750/50' : ''
                  }`}
                >
                  <div className="flex gap-3 w-full">
                    <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                      <FiBell className="text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? 'text-greyscale-0' : 'text-greyscale-200'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-primary-200 rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-greyscale-400 line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-greyscale-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                {index < mockNotifications.length - 1 && (
                  <DropdownMenuSeparator className="bg-greyscale-700" />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <FiBell className="mx-auto text-4xl text-greyscale-500 mb-2" />
            <p className="text-sm text-greyscale-400">Không có thông báo mới</p>
          </div>
        )}

        {/* Footer */}
        {mockNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-greyscale-700" />
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                className="w-full text-primary-200 hover:text-primary-300 hover:bg-greyscale-700"
                onClick={() => router.push('/notifications')}
              >
                Xem tất cả thông báo
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}