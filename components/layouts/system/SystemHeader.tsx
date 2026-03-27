"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

import { useAuthStore } from "@/stores/auth-store";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { primaryItems } from "./SystemSidebar.data";

import { LanguageSwitcher } from "../LanguageSwitcher";
import NotificationDropdown from "../NotificationDropdown";
import UserDropdown from "../UserDropdown";

function normalizePath(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

function formatFallbackSegment(segment: string) {
  return decodeURIComponent(segment)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getRouteEntries() {
  return primaryItems.flatMap((item) => {
    const itemEntries = item.href
      ? [{ titleKey: item.title, href: item.href, parent: null }]
      : [];

    const subItemEntries =
      item.subItems?.filter((subItem) => subItem.href).map((subItem) => ({
        titleKey: subItem.title,
        href: subItem.href as string,
        parent: {
          titleKey: item.title,
          href: item.href,
        },
      })) ?? [];

    return [...itemEntries, ...subItemEntries];
  });
}

export default function SystemHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("SystemSidebar");
  const user = useAuthStore((state) => state.user);

  const normalizedPath = normalizePath(pathname);
  const routeEntries = getRouteEntries();
  const matchedEntry = [...routeEntries]
    .filter(
      (entry) =>
        normalizedPath === entry.href ||
        normalizedPath.startsWith(`${entry.href}/`),
    )
    .sort((left, right) => right.href.length - left.href.length)[0];

  const breadcrumbItems = React.useMemo(() => {
    if (!matchedEntry) {
      const segments = normalizedPath.split("/").filter(Boolean);

      return segments.map((segment, index) => ({
        label: formatFallbackSegment(segment),
        href: `/${segments.slice(0, index + 1).join("/")}`,
        isLast: index === segments.length - 1,
      }));
    }

    const items: Array<{ label: string; href?: string; isLast?: boolean }> = [];

    if (matchedEntry.parent) {
      items.push({
        label: t(matchedEntry.parent.titleKey),
        href: matchedEntry.parent.href,
      });
    }

    items.push({
      label: t(matchedEntry.titleKey),
      href: matchedEntry.href,
    });

    const remainingPath = normalizedPath.slice(matchedEntry.href.length);
    const remainingSegments = remainingPath.split("/").filter(Boolean);
    const courseTitleVNParam = searchParams.get("titleVN");
    const courseTitleENParam = searchParams.get("titleEN");
    const legacyCourseTitleParam = searchParams.get("title");
    const localizedCourseTitle =
      locale === "en"
        ? courseTitleENParam || courseTitleVNParam || legacyCourseTitleParam
        : courseTitleVNParam || courseTitleENParam || legacyCourseTitleParam;

    remainingSegments.forEach((segment, index) => {
      const isCourseDetailLastSegment =
        matchedEntry.href === "/course-management" &&
        index === remainingSegments.length - 1 &&
        Boolean(localizedCourseTitle);

      items.push({
        label: isCourseDetailLastSegment
          ? (localizedCourseTitle as string)
          : formatFallbackSegment(segment),
        href: `${matchedEntry.href}/${remainingSegments
          .slice(0, index + 1)
          .join("/")}`,
      });
    });

    return items.map((item, index) => ({
      ...item,
      isLast: index === items.length - 1,
    }));
  }, [locale, matchedEntry, normalizedPath, searchParams, t]);

  const handleMarkAllAsRead = () => {
    console.log("Mark all notifications as read");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-greyscale-700 bg-greyscale-900 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Breadcrumb>
            <BreadcrumbList className="text-greyscale-300">
              {breadcrumbItems.map((breadcrumbItem, index) => (
                <React.Fragment
                  key={`${breadcrumbItem.href ?? breadcrumbItem.label}-${index}`}
                >
                  <BreadcrumbItem>
                    {breadcrumbItem.isLast || !breadcrumbItem.href ? (
                      <BreadcrumbPage className="truncate font-medium text-greyscale-0">
                        {breadcrumbItem.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={breadcrumbItem.href}
                          className="truncate text-greyscale-300 hover:text-greyscale-0"
                        >
                          {breadcrumbItem.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!breadcrumbItem.isLast && (
                    <BreadcrumbSeparator className="text-greyscale-500" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <NotificationDropdown
            hasNotifications={true}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
          <LanguageSwitcher />
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}