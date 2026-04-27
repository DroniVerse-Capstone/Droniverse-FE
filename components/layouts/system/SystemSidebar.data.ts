import React from "react";
import { canAccessRoute } from "@/lib/auth/access";
import {
  ArrowUpFromLine,
  Barcode,
  BookOpen,
  CircleHelp,
  FolderKanban,
  Grid2x2,
  Home,
  Plane,
  Route,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

export type SubItem = {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  subItems?: SubItem[];
};

export const filterNavItemsByRole = (
  items: NavItem[],
  roleName?: string | null,
): NavItem[] => {
  return items.reduce<NavItem[]>((result, item) => {
    if (item.subItems?.length) {
      const allowedSubItems = item.subItems.filter(
        (subItem) => !subItem.href || canAccessRoute(subItem.href, roleName),
      );

      if (allowedSubItems.length > 0) {
        result.push({
          ...item,
          subItems: allowedSubItems,
        });
      }

      return result;
    }

    if (!item.href || canAccessRoute(item.href, roleName)) {
      result.push(item);
    }

    return result;
  }, []);
};

export const primaryItems: NavItem[] = [
  {
    title: "dashboard.title",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "clubs.title",
    icon: Users,
    subItems: [
      { title: "clubs.subitems.club", href: "/club-management", icon: Users },
      { title: "clubs.subitems.request", href: "/club-requests", icon: UserCog },
    ],
  },
  {
    title: "courses.title",
    icon: BookOpen,
    subItems: [
      { title: "courses.subitems.course", href: "/course-management", icon: BookOpen },
      { title: "courses.subitems.code", href: "/course-codes-management", icon: Barcode },
      { title: "courses.subitems.curriculum", href: "/curriculum-management", icon: Route },
      { title: "courses.subitems.level", href: "/level-path-management", icon: ArrowUpFromLine},
    ],
  },
  {
    title: "labs.title",
    icon: FolderKanban,
    href: "/lab-management",
  },
  {
    title: "users.title",
    icon: UserCog,
    subItems: [
      { title: "users.subitems.user", href: "/user-management", icon: UserCog },
    ],
  },
  {
    title: "drone.title",
    icon: Plane,
    href: "/drone-management",
  },
  {
    title: "category.title",
    icon: Grid2x2,
    subItems: [
      { title: "category.subitems.drone", href: "/drone-category", icon: Settings },
    ],
  },
];

export const secondaryItems: NavItem[] = [
  {
    title: "settings.title",
    icon: Settings,
  },
  {
    title: "help.title",
    icon: CircleHelp,
  },
];