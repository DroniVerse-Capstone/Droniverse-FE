import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

type TablePaginationProps = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showSummary?: boolean;
  previousLabel?: string;
  nextLabel?: string;
};

type TableCustomProps<T> = {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  pagination?: TablePaginationProps;
};

function getVisiblePages(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
) {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, i) => i + 1,
    );
    return [...leftRange, "dots-right" as const, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRangeStart = totalPages - (3 + siblingCount * 2) + 1;
    const rightRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, i) => rightRangeStart + i,
    );
    return [1, "dots-left" as const, ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );

  return [1, "dots-left" as const, ...middleRange, "dots-right" as const, totalPages];
}

export function TableCustom<T>({
  headers,
  data,
  renderRow,
  pagination,
}: TableCustomProps<T>) {
  const t = useTranslations("Pagination");
  const previousLabel = pagination?.previousLabel ?? t("previous");
  const nextLabel = pagination?.nextLabel ?? t("next");
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize))
    : 1;
  const currentPage = pagination
    ? Math.min(Math.max(1, pagination.currentPage), totalPages)
    : 1;
  const siblingCount = pagination?.siblingCount ?? 1;
  const pageItems = pagination
    ? getVisiblePages(currentPage, totalPages, siblingCount)
    : [];

  const baseControlClass =
    "h-11 rounded border border-greyscale-700 bg-greyscale-900 text-greyscale-25 shadow-none transition-colors hover:bg-greyscale-800";

  const pageControlClass =
    "h-11 w-11 rounded border border-greyscale-700 bg-greyscale-900 text-greyscale-25 shadow-none transition-colors hover:bg-greyscale-800";

  return (
    <div className="space-y-4">
      <div className="rounded border border-greyscale-700">
        <div className="overflow-x-auto">
          <Table className="min-w-245">
          <TableHeader>
            <TableRow className="border-greyscale-700 bg-greyscale-900">
              {headers.map((header, idx) => (
                <TableHead key={idx}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => (
              <TableRow key={idx} className="border-greyscale-700 bg-greyscale-900/80 hover:bg-greyscale-800">
                {renderRow(item, idx)}
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {pagination.showSummary !== false && (
            <p className="text-xs text-greyscale-100 sm:text-sm">
              {t("page")} {currentPage}/{totalPages} • {t("sum")} {pagination.totalItems} {t("records")}
            </p>
          )}

          <Pagination className="justify-end sm:mx-0 sm:w-auto">
            <PaginationContent className="flex-wrap justify-end gap-2">
              <PaginationItem>
                <PaginationLink
                  href="#"
                  size="default"
                  className={cn(
                    baseControlClass,
                    "px-4 gap-1.5 [&>span:last-child]:hidden sm:[&>span:last-child]:inline",
                    currentPage <= 1 && "pointer-events-none opacity-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      pagination.onPageChange(currentPage - 1);
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>{previousLabel}</span>
                </PaginationLink>
              </PaginationItem>

              {pageItems.map((item, idx) => {
                if (item === "dots-left" || item === "dots-right") {
                  return (
                    <PaginationItem key={`${item}-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === currentPage}
                      className={cn(
                        pageControlClass,
                        item === currentPage &&
                          "bg-primary text-greyscale-0 border-primary hover:bg-primary-300",
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.onPageChange(item);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationLink
                  href="#"
                  size="default"
                  className={cn(
                    baseControlClass,
                    "px-4 gap-1.5 [&>span:first-child]:hidden sm:[&>span:first-child]:inline",
                    currentPage >= totalPages && "pointer-events-none opacity-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      pagination.onPageChange(currentPage + 1);
                    }
                  }}
                >
                  <span>{nextLabel}</span>
                  <ChevronRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}