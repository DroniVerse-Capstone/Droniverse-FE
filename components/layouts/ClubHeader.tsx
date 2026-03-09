"use client";

import Image from 'next/image';
import Link from 'next/link';
import { LanguageSwitcher } from './LanguageSwitcher';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown';
import { useAuthStore } from '@/stores/auth-store';

export default function ClubHeader() {
  const user = useAuthStore((state) => state.user);

  const handleMarkAllAsRead = () => {
    // TODO: Implement mark all as read logic
    console.log('Mark all notifications as read');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-greyscale-800 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[100px_100px] border-b border-greyscale-700 shadow-lg">
      <div className="h-[82px] px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center transition-transform hover:scale-105">
          <Image 
            src="/images/Logo-NoBg.png" 
            alt="DroniVerse Logo" 
            width={60} 
            height={60}
            className="object-contain"
          />
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications Dropdown */}
          <NotificationDropdown 
            hasNotifications={true}
            onMarkAllAsRead={handleMarkAllAsRead}
          />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Dropdown */}
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}