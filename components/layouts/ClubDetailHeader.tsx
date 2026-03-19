"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { IoPeople } from "react-icons/io5";

import { slugify } from "@/lib/utils/slugify";
import { useLocale } from "@/providers/i18n-provider";
import { useGetMyClubs } from "@/hooks/club/useClub";
import { AiOutlineSwap } from "react-icons/ai";
import ClubSwitcherDialog from "@/components/layouts/ClubSwitcherDialog";
import ClubDetailNav from "@/components/layouts/ClubDetailNav";

export default function ClubDetailHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);
  const isManager = pathname?.startsWith("/manager");
  const roleBase = isManager ? "/manager" : "/member";

  const { data: clubs = [] } = useGetMyClubs({});

  const handleSwitchClub = (clubName: string, clubId: string) => {
    router.push(`${roleBase}/${slugify(clubName)}-${clubId}`);
    setOpen(false);
  };

  const currentClub = clubs.find((club) =>
    pathname?.endsWith(`-${club.clubID}`),
  );
  const currentClubName = currentClub
    ? locale === "en"
      ? currentClub.nameEN || currentClub.nameVN
      : currentClub.nameVN
    : "Đổi câu lạc bộ";

  return (
    <div className="px-6 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-fit max-w-full shrink-0">
          <ClubSwitcherDialog
            open={open}
            onOpenChange={setOpen}
            onSelectClub={handleSwitchClub}
            trigger={
              <button
                type="button"
                className="group max-w-full rounded-lg text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Switch club"
              >
                <div className="w-fit max-w-full rounded border border-greyscale-700 bg-greyscale-800/95 px-4 py-2.5 shadow-sm shadow-primary/10 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-greyscale-600 group-hover:bg-greyscale-700/95 group-hover:shadow-md group-hover:shadow-primary/20">
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="rounded-md bg-primary/15 p-1.5 transition-colors duration-200 group-hover:bg-primary/20">
                        <IoPeople size={18} className="text-primary" />
                      </div>
                      <span className="truncate font-medium text-greyscale-100">{currentClubName}</span>
                    </div>
                    <AiOutlineSwap
                      size={16}
                      className="shrink-0 text-greyscale-300 transition-transform duration-200 group-hover:translate-y-0.5"
                    />
                  </div>
                </div>
              </button>
            }
          />
        </div>

        <div className="w-full lg:flex lg:flex-1 lg:justify-end">
          <ClubDetailNav
            role={isManager ? "CLUB_MANAGER" : "CLUB_MEMBER"}
            className="lg:w-auto"
          />
        </div>
      </div>
    </div>
  );
}
