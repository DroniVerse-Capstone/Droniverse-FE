"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import {
  Album,
  BarChart,
  ChevronLeft,
  ChevronRight,
  House,
  Info,
  Library,
  MinusCircle,
  PlusCircle,
  Receipt,
  ScrollText,
  Settings,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { AiOutlineSwap } from "react-icons/ai";
import { IoPeople } from "react-icons/io5";

import { useGetMyClubs } from "@/hooks/club/useClub";
import { slugify } from "@/lib/utils/slugify";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ClubSwitcherDialog from "@/components/layouts/ClubSwitcherDialog";

type ManagerSidebarProps = {
  clubSlug: string;
};

type ManagerNavSubItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: (pathname: string, searchParams: URLSearchParams) => boolean;
};

type ManagerNavItem = {
  id: string;
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: ManagerNavSubItem[];
  isActive?: (pathname: string, searchParams: URLSearchParams) => boolean;
};

function buildManagerNavItems(
  clubSlug: string,
  t: (key: string) => string,
): ManagerNavItem[] {
  const base = `/manager/${clubSlug}`;

  return [
    {
      id: "overview",
      title: t("overview"),
      href: base,
      icon: House,
      isActive: (pathname) => pathname === base,
    },
    {
      id: "members",
      title: t("members.title"),
      icon: Users,
      subItems: [
        {
          title: t("members.subitems.management"),
          href: `${base}/members`,
          icon: Users,
          isActive: (pathname) => pathname === `${base}/members`,
        },
        {
          title: t("members.subitems.requests"),
          href: `${base}/members-requests`,
          icon: UserCheck,
          isActive: (pathname) => pathname === `${base}/members-requests`,
        },
      ],
    },
    {
      id: "courses",
      title: t("courses.title"),
      icon: Library,
      subItems: [
        {
          title: t("courses.subitems.available"),
          href: `${base}/courses`,
          icon: Album,
          isActive: (pathname) => pathname === `${base}/courses`,
        },
        {
          title: t("courses.subitems.progress"),
          href: `${base}/courses-learning-progress`,
          icon: BarChart,
          isActive: (pathname) =>
            pathname === `${base}/courses-learning-progress`,
        },
      ],
    },
    {
      id: "competitions",
      title: t("competitions"),
      href: `${base}/competitions`,
      icon: Trophy,
      isActive: (pathname) =>
        pathname === `${base}/competitions` ||
        pathname.startsWith(`${base}/competitions/`),
    },
    {
      id: "settings",
      title: t("settings.title"),
      icon: Settings,
      subItems: [
        {
          title: t("settings.subitems.clubInfo"),
          href: `${base}/club-info`,
          icon: Info,
          isActive: (pathname) => pathname === `${base}/club-info`,
        },
        {
          title: t("settings.subitems.clubRules"),
          href: `${base}/club-rules`,
          icon: ScrollText,
          isActive: (pathname) => pathname === `${base}/club-rules`,
        },
      ],
    },
  ];
}

function isItemActive(
  pathname: string,
  searchParams: URLSearchParams,
  item: ManagerNavItem,
) {
  if (item.isActive && item.isActive(pathname, searchParams)) {
    return true;
  }

  if (item.href && pathname === item.href) {
    return true;
  }

  return (
    item.subItems?.some((subItem) =>
      subItem.isActive
        ? subItem.isActive(pathname, searchParams)
        : pathname === subItem.href,
    ) ?? false
  );
}

function NavEntry({
  item,
  pathname,
  searchParams,
  collapsed,
  open,
  onToggle,
  onExpand,
}: {
  item: ManagerNavItem;
  pathname: string;
  searchParams: URLSearchParams;
  collapsed: boolean;
  open: boolean;
  onToggle: (nextOpen: boolean) => void;
  onExpand: () => void;
}) {
  const Icon = item.icon;
  const active = isItemActive(pathname, searchParams, item);
  const hasSubItems = Boolean(item.subItems?.length);

  const entryClassName = cn(
    "group flex w-full items-center rounded px-2 py-2 text-left text-base font-Regular text-greyscale-50 transition-all duration-300",
    collapsed ? "justify-center" : "gap-3",
    "hover:bg-white/5 hover:text-greyscale-0",
    active && "bg-greyscale-700 text-greyscale-0",
    open && "text-greyscale-0",
  );

  const labelClassName = cn(
    "overflow-hidden whitespace-nowrap transition-all duration-300",
    collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100",
  );

  const contentClassName = cn(
    "flex min-w-0 items-center",
    collapsed ? "justify-center" : "flex-1 gap-3",
  );

  const renderCollapsedTooltip = (content: React.ReactElement) => {
    if (!collapsed) {
      return content;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  };

  if (hasSubItems) {
    const triggerButton = (
      <button
        type="button"
        className={entryClassName}
        onClick={() => {
          if (collapsed) {
            onExpand();
          }
        }}
      >
        <span className={contentClassName}>
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-greyscale-50 transition-colors duration-300",
              (active || open) &&
                "border-greyscale-600 bg-white/12 text-greyscale-0",
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span className={cn("min-w-0 flex-1", labelClassName)}>
            {item.title}
          </span>
        </span>

        {!collapsed && (
          <span className="flex items-center gap-2 text-xs">
            {open ? (
              <MinusCircle className="h-4.5 w-4.5 text-greyscale-100" />
            ) : (
              <PlusCircle className="h-4.5 w-4.5 text-greyscale-100" />
            )}
          </span>
        )}
      </button>
    );

    return (
      <Collapsible.Root
        open={!collapsed && open}
        onOpenChange={(nextOpen) => {
          if (!collapsed) {
            onToggle(nextOpen);
          }
        }}
      >
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Collapsible.Trigger asChild>{triggerButton}</Collapsible.Trigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              {item.title}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Collapsible.Trigger asChild>{triggerButton}</Collapsible.Trigger>
        )}

        <div
          className={cn(
            "grid overflow-hidden transition-all duration-300",
            !collapsed && open
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <Collapsible.Content forceMount className="min-h-0">
            <div className="mt-1 space-y-1 overflow-hidden border-l border-greyscale-700 p-2">
              {item.subItems?.map((subItem) => {
                const SubItemIcon = subItem.icon;
                const subActive = subItem.isActive
                  ? subItem.isActive(pathname, searchParams)
                  : subItem.href === pathname;

                return (
                  <Link
                    key={subItem.title}
                    href={subItem.href}
                    className={cn(
                      "flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-greyscale-50 transition-colors duration-200",
                      subActive
                        ? "bg-greyscale-700 text-greyscale-0"
                        : "hover:bg-white/6 hover:text-greyscale-0",
                    )}
                  >
                    <SubItemIcon
                      className={cn(
                        "h-4 w-4 shrink-0 text-greyscale-100",
                        subActive && "text-primary",
                      )}
                    />
                    <span className="truncate">{subItem.title}</span>
                  </Link>
                );
              })}
            </div>
          </Collapsible.Content>
        </div>
      </Collapsible.Root>
    );
  }

  if (item.href) {
    return renderCollapsedTooltip(
      <Link href={item.href} className={entryClassName}>
        <span className={contentClassName}>
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-greyscale-50 transition-colors duration-300",
              active && "border-primary-200 bg-primary/12 text-primary-200",
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span className={cn("truncate", labelClassName)}>{item.title}</span>
        </span>
      </Link>,
    );
  }

  return null;
}

export default function ManagerSidebar({ clubSlug }: ManagerSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("ManagerSidebar");

  const [openClubSwitcher, setOpenClubSwitcher] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>(
    () => ({
      members: false,
      finance: false,
      settings: false,
    }),
  );

  const { data: clubs = [] } = useGetMyClubs({});

  const navItems = React.useMemo(
    () => buildManagerNavItems(clubSlug, t),
    [clubSlug, t],
  );

  const currentClub = React.useMemo(
    () => clubs.find((club) => clubSlug.endsWith(`-${club.clubID}`)),
    [clubs, clubSlug],
  );

  const currentClubName = currentClub
    ? locale === "en"
      ? currentClub.nameEN || currentClub.nameVN
      : currentClub.nameVN
    : t("switchClub");

  const handleSwitchClub = (clubName: string, clubId: string) => {
    router.push(`/manager/${slugify(clubName)}-${clubId}`);
    setOpenClubSwitcher(false);
  };

  React.useEffect(() => {
    setOpenMenus((current) => {
      const nextState = { ...current };
      let hasChanged = false;

      for (const item of navItems) {
        const isActiveGroup = Boolean(
          item.subItems?.some((subItem) =>
            subItem.isActive
              ? subItem.isActive(pathname, searchParams)
              : subItem.href === pathname,
          ),
        );

        // Keep manual toggle state; only auto-open the currently active group.
        if (isActiveGroup && !nextState[item.id]) {
          hasChanged = true;
          nextState[item.id] = true;
        }
      }

      if (!hasChanged) {
        return current;
      }

      return nextState;
    });
  }, [navItems, pathname, searchParams]);

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-greyscale-700 bg-greyscale-800 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[100px_100px] py-4 text-greyscale-0 transition-[width] duration-300 ease-out",
          collapsed ? "w-20 px-0" : "w-72.5 px-2",
        )}
      >
        <div
          className={cn(
            "relative flex items-center pb-4",
            collapsed ? "justify-center px-2" : "gap-3 px-2",
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10" onClick={() => router.push("/manager")}>
            <Image
              src="/images/Logo-NoBg.png"
              alt="Droniverse"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </div>

          <div
            className={cn(
              "min-w-0 flex-1 overflow-hidden transition-all duration-300",
              collapsed ? "max-w-0 opacity-0" : "max-w-45 opacity-100",
            )}
          >
            <div className="truncate text-base font-semibold tracking-tight">
              Droniverse
            </div>
            <div className="truncate text-xs text-greyscale-200">
              {t("subtitle")}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-greyscale-50 transition-colors duration-200 hover:bg-white/10",
              collapsed && "absolute left-18 top-0",
            )}
            aria-label={t("aria.collapseSidebar")}
          >
            {collapsed ? (
              <ChevronRight className="h-4.5 w-4.5" />
            ) : (
              <ChevronLeft className="h-4.5 w-4.5" />
            )}
          </button>
        </div>

        <div className="mb-3 px-2">
          <ClubSwitcherDialog
            open={openClubSwitcher}
            onOpenChange={setOpenClubSwitcher}
            onSelectClub={handleSwitchClub}
            trigger={
              <button
                type="button"
                className={cn(
                  "group w-full rounded border border-greyscale-700 bg-greyscale-800 px-3 py-2 text-left transition-all hover:border-greyscale-600 hover:bg-greyscale-700",
                  collapsed && "flex justify-center px-0",
                )}
                aria-label={t("aria.switchClub")}
              >
                {collapsed ? (
                  <AiOutlineSwap size={16} className="text-greyscale-200" />
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="rounded-md bg-primary/15 p-1.5">
                        <IoPeople size={16} className="text-primary" />
                      </div>
                      <span className="truncate text-sm font-medium text-greyscale-100">
                        {currentClubName}
                      </span>
                    </div>
                    <AiOutlineSwap
                      size={15}
                      className="shrink-0 text-greyscale-300"
                    />
                  </div>
                )}
              </button>
            }
          />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          <div className="space-y-2 px-1">
            {navItems.map((item) => (
              <NavEntry
                key={item.id}
                item={item}
                pathname={pathname}
                searchParams={searchParams}
                collapsed={collapsed}
                open={Boolean(openMenus[item.id])}
                onToggle={(nextOpen) =>
                  setOpenMenus((current) => ({
                    ...current,
                    [item.id]: nextOpen,
                  }))
                }
                onExpand={() => {
                  setCollapsed(false);
                  setOpenMenus((current) => ({
                    ...current,
                    [item.id]: true,
                  }));
                }}
              />
            ))}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
