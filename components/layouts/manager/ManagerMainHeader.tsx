"use client";

import { LanguageSwitcher } from "@/components/layouts/LanguageSwitcher";
import UserDropdown from "@/components/layouts/UserDropdown";
import { useAuthStore } from "@/stores/auth-store";

export default function ManagerMainHeader() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-30 border-b border-greyscale-700 bg-greyscale-800 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[100px_100px] backdrop-blur">
      <div className="flex items-center justify-end gap-3 px-4 py-3 md:px-6">
        <LanguageSwitcher />
        <UserDropdown user={user} />
      </div>
    </header>
  );
}