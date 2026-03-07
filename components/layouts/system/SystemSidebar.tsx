"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  MinusCircle,
  PlusCircle,
} from "lucide-react";

import {
  primaryItems,
  secondaryItems,
  type NavItem,
} from "./SystemSidebar.data";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/providers/i18n-provider";

type TranslateFn = (key: string) => string;

function isItemActive(pathname: string, item: NavItem) {
  if (item.href && pathname === item.href) {
    return true;
  }

  return item.subItems?.some((subItem) => subItem.href === pathname) ?? false;
}

function NavEntry({
  item,
  pathname,
  collapsed,
  open,
  onToggle,
  onExpand,
  t,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  open: boolean;
  onToggle: (nextOpen: boolean) => void;
  onExpand: () => void;
  t: TranslateFn;
}) {
  const Icon = item.icon;
  const active = isItemActive(pathname, item);
  const hasSubItems = Boolean(item.subItems?.length);

  const entryClassName = cn(
  "group flex w-full items-center rounded px-2 py-2 text-left text-base font-Regular text-greyscale-100 transition-all duration-300",
  collapsed ? "justify-center" : "gap-3",
  "hover:bg-white/5 hover:text-greyscale-0",
  (active) && "bg-greyscale-700 text-greyscale-0",
  (open) && "text-greyscale-0",
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
          {t(item.title)}
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
            {t(item.title)}
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
              {t(item.title)}
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
                const subActive = subItem.href === pathname;
                const subClassName = cn(
                  "flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-greyscale-100 transition-colors duration-200",
                  subActive
                    ? "bg-greyscale-700 text-greyscale-0"
                    : "hover:bg-white/6 hover:text-greyscale-0",
                );

                if (subItem.href) {
                  return (
                    <Link
                      key={subItem.title}
                      href={subItem.href}
                      className={subClassName}
                    >
                      <SubItemIcon
                        className={cn(
                          "h-4 w-4 shrink-0 text-greyscale-100",
                          subActive && "text-primary",
                        )}
                      />
                      <span className="truncate">{t(subItem.title)}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={subItem.title}
                    type="button"
                    className={subClassName}
                  >
                    <SubItemIcon
                      className={cn(
                        "h-4 w-4 shrink-0 text-greyscale-100",
                        subActive && "text-primary",
                      )}
                    />
                    <span className="truncate">{t(subItem.title)}</span>
                  </button>
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
          <span className={cn("truncate", labelClassName)}>{t(item.title)}</span>
        </span>
      </Link>
    );
  }

  return renderCollapsedTooltip(
    <button type="button" className={entryClassName}>
      <span className={contentClassName}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-greyscale-50 transition-colors duration-300">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className={cn("truncate", labelClassName)}>{t(item.title)}</span>
      </span>
    </button>
  );
}

export default function SystemSidebar() {
  const pathname = usePathname();
  const t = useTranslations("SystemSidebar");
  const [collapsed, setCollapsed] = React.useState(false);
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>(
    () => ({
      "clubs.title": false,
      "courses.title": false,
      "users.title": false,
      "category.title": false,
    }),
  );

  React.useEffect(() => {
    setOpenMenus((current) => {
      const nextState = { ...current };

      for (const item of primaryItems) {
        if (item.subItems?.some((subItem) => subItem.href === pathname)) {
          nextState[item.title] = true;
        }
      }

      return nextState;
    });
  }, [pathname]);

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="space-y-2">
      <div
        className={cn(
          "px-3 text-xs font-medium uppercase tracking-[0.24em] text-greyscale-400 transition-all duration-300",
          collapsed ? "opacity-0" : "opacity-100",
        )}
      >
        {t(title)}
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <NavEntry
            key={item.title}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            open={Boolean(openMenus[item.title])}
            onToggle={(nextOpen) =>
              setOpenMenus((current) => ({
                ...current,
                [item.title]: nextOpen,
              }))
            }
            onExpand={() => {
              setCollapsed(false);
              setOpenMenus((current) => ({
                ...current,
                [item.title]: true,
              }));
            }}
            t={t}
          />
        ))}
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-greyscale-700 bg-greyscale-900 py-4 text-greyscale-0 transition-[width] duration-300 ease-out",
          collapsed ? "w-20 px-0" : "w-72.5 px-2",
        )}
      >
        <div
          className={cn(
            "relative flex items-center pb-5",
            collapsed ? "justify-center px-2" : "gap-3 px-2",
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
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
            <div className="truncate text-xs text-greyscale-300">
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
          >
            {collapsed ? (
              <ChevronRight className="h-4.5 w-4.5" />
            ) : (
              <ChevronLeft className="h-4.5 w-4.5" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          <div className="space-y-6 px-1">
            {renderSection("primary", primaryItems)}
            <Separator className="bg-greyscale-700" />
            {renderSection("secondary", secondaryItems)}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
