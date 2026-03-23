"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';

interface UserDropdownProps {
  user: {
    userId?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    roleName?: string;
    avatar?: string;
  } | null;
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  const getAvatarInitials = (name: string) => {
    if (!name) return 'D';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full p-0 w-11 h-11 border-2 border-greyscale-700 hover:border-primary-200 transition-colors overflow-hidden"
        >
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.username || 'User'}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary-200 to-secondary-200 flex items-center justify-center text-greyscale-0 font-semibold text-sm">
              {getAvatarInitials(user?.firstName || user?.username || 'User')}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-greyscale-800 border-greyscale-700">
        {user && (
          <>
            <div className="px-3 py-2 text-sm">
              <p className="font-semibold text-greyscale-0">
                {user.username}
              </p>
              <p className="text-xs text-greyscale-300 truncate">{user.email}</p>
              {user.roleName && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-primary-200/20 text-primary-200">
                  {user.roleName}
                </span>
              )}
            </div>
            <DropdownMenuSeparator className="bg-greyscale-700" />
          </>
        )}
        
        <DropdownMenuItem
          onClick={() => router.push('/profile')}
          className="cursor-pointer text-greyscale-100 hover:text-greyscale-0 hover:bg-greyscale-700 focus:bg-greyscale-700"
        >
          <FiUser className="mr-2" />
          Hồ sơ
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          className="cursor-pointer text-greyscale-100 hover:text-greyscale-0 hover:bg-greyscale-700 focus:bg-greyscale-700"
        >
          <FiSettings className="mr-2" />
          Cài đặt
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-greyscale-700" />
        
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={logout.isPending}
          className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-400/10 focus:bg-red-400/10"
        >
          <FiLogOut className="mr-2" />
          {logout.isPending ? <Spinner /> : 'Đăng xuất'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}