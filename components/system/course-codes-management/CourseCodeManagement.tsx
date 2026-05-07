"use client";

import React from "react";

import CommonDropdown, {
  type CommonDropdownOption,
} from "@/components/common/CommonDropdown";
import { TableCustom } from "@/components/common/TableCustom";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import { useGetAcademyCodes } from "@/hooks/code/useCode";
import { useLocale } from "@/providers/i18n-provider";
import type {
  AcademyCodeItem,
  AcademyCodeStatus,
} from "@/validations/code/code";
import { formatDateTime } from "@/lib/utils/format-date";
import Image from "next/image";

const STATUS_OPTIONS: Array<{
  value: AcademyCodeStatus | "";
  labelVi: string;
  labelEn: string;
}> = [
  { value: "", labelVi: "Tất cả", labelEn: "All" },
  { value: "AVAILABLE", labelVi: "Khả dụng", labelEn: "Available" },
  { value: "USED", labelVi: "Đã dùng", labelEn: "Used" },
  { value: "EXPIRED", labelVi: "Hết hạn", labelEn: "Expired" },
];

function formatUserName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`.trim();
}

function getCourseTitle(course: AcademyCodeItem["course"], locale: string) {
  const currentVersion = course.courseVersions[0];

  return locale === "vi"
    ? currentVersion?.titleVN || currentVersion?.titleEN || course.courseID
    : currentVersion?.titleEN || currentVersion?.titleVN || course.courseID;
}

function getStatusBadgeClass(status: AcademyCodeStatus) {
  switch (status) {
    case "AVAILABLE":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "USED":
      return "border-sky-500/20 bg-sky-500/10 text-sky-300";
    case "EXPIRED":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    default:
      return "border-greyscale-600 bg-greyscale-800 text-greyscale-100";
  }
}

function getStatusLabel(status: AcademyCodeStatus, locale: string) {
  switch (status) {
    case "AVAILABLE":
      return locale === "vi" ? "Khả dụng" : "Available";
    case "USED":
      return locale === "vi" ? "Đã dùng" : "Used";
    case "EXPIRED":
      return locale === "vi" ? "Hết hạn" : "Expired";
    default:
      return status;
  }
}

export default function CourseCodeManagement() {
  const locale = useLocale();
  const [status, setStatus] = React.useState<AcademyCodeStatus | "">("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(8);

  const { data, isLoading, isError, error } = useGetAcademyCodes({
    status: status || undefined,
    currentPage,
    pageSize,
  });

  const overview = data?.overview;
  const codesPaging = data?.codes;
  const codes = codesPaging?.data ?? [];
  const statusOptions = React.useMemo<CommonDropdownOption[]>(
    () =>
      STATUS_OPTIONS.map((option) => ({
        value: option.value,
        label: locale === "vi" ? option.labelVi : option.labelEn,
      })),
    [locale],
  );

  const headers = [
    locale === "vi" ? "STT" : "No.",
    locale === "vi" ? "Mã code" : "Code ID",
    locale === "vi" ? "Khóa học" : "Course",
    locale === "vi" ? "Câu lạc bộ" : "Club",
    locale === "vi" ? "Chủ sở hữu" : "Owner",
    locale === "vi" ? "Người dùng" : "Used by",
    locale === "vi" ? "Hết hạn" : "Expired at",
    locale === "vi" ? "Trạng thái" : "Status",
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isError) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          {error.response?.data?.message ||
            error.message ||
            (locale === "vi"
              ? "Không thể tải danh sách code."
              : "Unable to load codes list.")}
        </p>
      </Empty>
    );
  }

  return (
    <section className="space-y-5">
      <header className="overflow-hidden rounded border border-greyscale-700 bg-linear-to-br from-greyscale-900 via-greyscale-900 to-greyscale-950 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold text-greyscale-0">
                {locale === "vi" ? "Quản lý mã code" : "Code management"}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-greyscale-100">
                {locale === "vi"
                  ? "Theo dõi toàn bộ code của hệ thống, lọc theo trạng thái và xem nhanh số lượng khả dụng, đã dùng, hết hạn."
                  : "Track all system codes, filter by status, and review available, used, and expired totals at a glance."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-greyscale-100 sm:grid-cols-4">
              <div className="rounded border border-white/5 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-greyscale-300">
                  {locale === "vi" ? "Tổng" : "Total"}
                </p>
                <p className="mt-1 text-lg font-semibold text-greyscale-0">
                  {overview?.totalCodes ?? 0}
                </p>
              </div>
              <div className="rounded border border-emerald-500/15 bg-emerald-500/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-emerald-200/80">
                  {locale === "vi" ? "Khả dụng" : "Available"}
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-50">
                  {overview?.availableCodes ?? 0}
                </p>
              </div>
              <div className="rounded border border-sky-500/15 bg-sky-500/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-sky-200/80">
                  {locale === "vi" ? "Đã dùng" : "Used"}
                </p>
                <p className="mt-1 text-lg font-semibold text-sky-50">
                  {overview?.usedCodes ?? 0}
                </p>
              </div>
              <div className="rounded border border-amber-500/15 bg-amber-500/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-amber-200/80">
                  {locale === "vi" ? "Hết hạn" : "Expired"}
                </p>
                <p className="mt-1 text-lg font-semibold text-amber-50">
                  {overview?.expiredCodes ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm rounded border border-white/5 bg-white/5 p-4 backdrop-blur-sm lg:w-90">
            <CommonDropdown
              value={status}
              onChange={(value) => {
                setCurrentPage(1);
                setStatus(value as AcademyCodeStatus | "");
              }}
              options={statusOptions}
              label={
                locale === "vi" ? "Lọc theo trạng thái" : "Filter by status"
              }
              placeholder={
                locale === "vi" ? "Chọn trạng thái" : "Choose status"
              }
              triggerClassName="mt-0 h-11 border-greyscale-700 bg-greyscale-950/90 text-greyscale-0 hover:bg-greyscale-900"
              contentClassName="bg-greyscale-900 border-greyscale-700"
            />
          </div>
        </div>
      </header>

      {codes.length === 0 ? (
        <Empty>
          <p className="text-sm text-muted-foreground">
            {locale === "vi" ? "Không có code nào." : "No codes found."}
          </p>
        </Empty>
      ) : (
        <TableCustom
          headers={headers}
          data={codes}
          renderRow={(code: AcademyCodeItem, index) => (
            <>
              <TableCell>
                {(codesPaging?.pageIndex ?? currentPage) * pageSize -
                  pageSize +
                  index +
                  1}
              </TableCell>
              <TableCell className="font-medium text-greyscale-0">
                {code.codeID}
              </TableCell>
              <TableCell className="max-w-72 text-greyscale-100">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium text-greyscale-0">
                      {getCourseTitle(code.course, locale)}
                    </p>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <CourseLevelBadge level={code.course.level} />
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-64 text-greyscale-100">
                {code.club ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="overflow-hidden rounded border border-greyscale-700 bg-greyscale-800">
                      {code.club.imageUrl ? (
                        <Image
                          src={code.club.imageUrl}
                          alt={
                            locale === "vi"
                              ? code.club.clubNameVN
                              : code.club.clubNameEN
                          }
                          className="h-full w-full object-cover"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-greyscale-300">
                          CLB
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-greyscale-0">
                        {locale === "vi"
                          ? code.club.clubNameVN
                          : code.club.clubNameEN}
                      </p>
                    </div>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="max-w-56 text-greyscale-100">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium text-greyscale-0">
                    {formatUserName(code.ownerUser)}
                  </span>
                  <span className="truncate text-xs text-greyscale-300">
                    {code.ownerUser.email}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-56 text-greyscale-100">
                {code.usedByUser ? (
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium text-greyscale-0">
                      {formatUserName(code.usedByUser)}
                    </span>
                    <span className="truncate text-xs text-greyscale-300">
                      {code.usedByUser.email}
                    </span>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="text-greyscale-100">
                {formatDateTime(code.expireDate)}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass(code.status)}
                >
                  {getStatusLabel(code.status, locale)}
                </Badge>
              </TableCell>
            </>
          )}
          pagination={
            codesPaging
              ? {
                  currentPage: codesPaging.pageIndex,
                  pageSize: codesPaging.pageSize,
                  totalItems: codesPaging.totalRecords,
                  onPageChange: setCurrentPage,
                  showSummary: true,
                }
              : undefined
          }
        />
      )}
    </section>
  );
}
