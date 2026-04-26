"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";
import { useTranslations } from "@/providers/i18n-provider";

type ClubRole = "CLUB_MEMBER" | "CLUB_MANAGER";

type NavKey = "overview" | "courses" | "myCourses" | "competitions" | "prizes" | "members";

type ClubDetailNavLinks = Record<NavKey, string>;

type ClubDetailNavProps = {
  role?: ClubRole;
  clubSlug?: string;
  links?: Partial<ClubDetailNavLinks>;
  className?: string;
};

const navLabels: Record<NavKey, string> = {
  overview: "home",
  courses: "courses",
  myCourses: "myCourses",
  competitions: "competitions",
  prizes: "prizes",
  members: "members",
};

const getRoleFromPathname = (pathname: string): ClubRole => {
  if (pathname.startsWith("/manager")) return "CLUB_MANAGER";
  return "CLUB_MEMBER";
};

const getClubSlugFromPathname = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);
  return segments[1] || "";
};

const isActivePath = (pathname: string, href: string, key: NavKey) => {
  if (key === "overview") return pathname === href;
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
};

export default function ClubDetailNav({
  role,
  clubSlug,
  links,
  className,
}: ClubDetailNavProps) {
  const pathname = usePathname();
  const t = useTranslations("ClubDetail.Nav");
  const resolvedRole = role || getRoleFromPathname(pathname || "");
  const resolvedSlug = clubSlug || getClubSlugFromPathname(pathname || "");

  const roleBase = resolvedRole === "CLUB_MANAGER" ? "/manager" : "/member";
  const detailBase = resolvedSlug ? `${roleBase}/${resolvedSlug}` : roleBase;

  const defaultLinks: ClubDetailNavLinks = {
    overview: detailBase,
    members: `${detailBase}/members`,
    courses: `${detailBase}/courses`,
    myCourses: `${detailBase}/my-courses`,
    competitions: `${detailBase}/competitions`,
    prizes: `${detailBase}/prizes`,
  };

  const finalLinks: ClubDetailNavLinks = {
    ...defaultLinks,
    ...links,
  };

  const navKeys: NavKey[] =
    resolvedRole === "CLUB_MANAGER"
      ? ["overview", "members", "courses", "myCourses", "competitions"]
      : ["overview", "courses", "myCourses", "competitions"];

  return (
    <nav
      className={cn("w-full", className)}
      aria-label="Club detail navigation"
    >
      <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded border border-greyscale-700 bg-greyscale-800 p-1">
        {navKeys.map((key) => {
          const href = finalLinks[key];
          const active = isActivePath(pathname || "", href, key);

          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "whitespace-nowrap rounded px-4 py-2 text-2md transition-colors",
                active
                  ? "bg-greyscale-900 text-primary"
                  : "text-greyscale-0 hover:bg-greyscale-700",
              )}
            >
              {t(navLabels[key])}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
