"use client";

import React, { useMemo } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/providers/i18n-provider";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AppPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

export default function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: AppPaginationProps) {
  const t = useTranslations("Pagination");
  const pageItems = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  }, [currentPage, totalPages]);

  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const baseControlClass =
    "h-11 rounded border border-greyscale-700 bg-greyscale-900 text-greyscale-25 shadow-none transition-colors hover:bg-greyscale-800";

  const pageControlClass =
    "h-11 w-11 rounded border border-greyscale-700 bg-greyscale-900 text-greyscale-25 shadow-none transition-colors hover:bg-greyscale-800";

  return (
    <Pagination className={cn("mx-0 w-auto justify-end", className)}>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <PaginationLink
            href="#"
            size="default"
            className={cn(
              baseControlClass,
              "px-4 gap-1.5 [&>span:last-child]:hidden sm:[&>span:last-child]:inline",
              (currentPage <= 1 || disabled) && "pointer-events-none opacity-50",
            )}
            onClick={(event) => {
              event.preventDefault();
              if (currentPage <= 1 || disabled) {
                return;
              }
              onPageChange(Math.max(1, currentPage - 1));
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{t("previous")}</span>
          </PaginationLink>
        </PaginationItem>

        {pageItems.map((item, index) => (
          <PaginationItem key={`${item}-${index}`}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={item === currentPage}
                onClick={(event) => {
                  event.preventDefault();
                  if (disabled || item === currentPage) {
                    return;
                  }
                  onPageChange(item);
                }}
                className={cn(
                  pageControlClass,
                  item === currentPage &&
                    "bg-primary text-greyscale-0 border-primary hover:bg-primary-300",
                  disabled && "pointer-events-none opacity-60",
                )}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationLink
            href="#"
            size="default"
            className={cn(
              baseControlClass,
              "px-4 gap-1.5 [&>span:first-child]:hidden sm:[&>span:first-child]:inline",
              (currentPage >= totalPages || disabled) &&
                "pointer-events-none opacity-50",
            )}
            onClick={(event) => {
              event.preventDefault();
              if (currentPage >= totalPages || disabled) {
                return;
              }
              onPageChange(Math.min(totalPages, currentPage + 1));
            }}
          >
            <span>{t("next")}</span>
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export type { AppPaginationProps };