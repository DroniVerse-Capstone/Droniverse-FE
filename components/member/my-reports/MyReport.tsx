"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { useGetMyReports } from "@/hooks/report/useReport";
import { useLocale } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { IoMdArrowBack } from "react-icons/io";
import { PolarLabelContextProvider } from "recharts/types/component/Label";

const PAGE_SIZE = 10;

const reportTypeOptions = [
  { labelEN: "All", labelVN: "Tất cả", value: undefined },
  { labelEN: "Club", labelVN: "Câu lạc bộ", value: "Club" },
  { labelEN: "CourseVersion", labelVN: "Khóa học", value: "CourseVersion" },
] as const;

export default function MyReport() {
  const router = useRouter();
  const locale = useLocale();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [reportType, setReportType] = React.useState<"Club" | "CourseVersion" | "User" | undefined>(undefined);

  const { data, isLoading, isError, error, isFetching } = useGetMyReports({
    pageIndex: currentPage,
    pageSize: PAGE_SIZE,
    reportType,
  });

  const reports = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const headers = [
    locale === "vi" ? "STT" : "No.",
    locale === "vi" ? "Loại khiếu nại" : "Report Type",
    locale === "vi" ? "Nội dung bị khiếu nại" : "Reported Item",
    locale === "vi" ? "Nội dung" : "Content",
    locale === "vi" ? "Phản hồi" : "Response",
    locale === "vi" ? "Người phản hồi" : "Responder",
    locale === "vi" ? "Trạng thái" : "Status",
  ];

  const getReportTypeLabel = (value: string) => {
    if (value === "Club") return locale === "vi" ? "Câu lạc bộ" : "Club";
    if (value === "CourseVersion") return locale === "vi" ? "Khóa học" : "Course";
    if (value === "User") return locale === "vi" ? "Người dùng" : "User";
    return value;
  };

  const getContent = (vn: string | null, en: string | null) => (locale === "vi" ? vn || en : en || vn);

  const getStatusBadge = (hasResponse: boolean) => {
    if (hasResponse) {
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          {locale === "vi" ? "Đã phản hồi" : "Responded"}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
        {locale === "vi" ? "Chờ phản hồi" : "Pending"}
      </span>
    );
  };

  return (
    <div className="space-y-4 px-6 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Button icon={<IoMdArrowBack />} variant="outline"  onClick={() => router.back()}>
            {locale === "vi" ? "Quay lại" : "Back"}
          </Button>
          <h1 className="text-3xl font-bold text-greyscale-0">
            {locale === "vi" ? "Lịch sử khiếu nại" : "Report History"}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {reportTypeOptions.map((option) => {
            const displayLabel = locale === "vi" ? option.labelVN : option.labelEN;
            return (
              <button
                key={`${option.labelEN}-${option.labelVN}`}
                onClick={() => {
                  setCurrentPage(1);
                  setReportType(option.value);
                }}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  reportType === option.value
                    ? "bg-primary text-greyscale-0"
                    : "bg-greyscale-700 text-greyscale-100 hover:bg-greyscale-600"
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : isError ? (
        <p className="text-sm text-error">
          {error.response?.data?.message || error.message || (locale === "vi" ? "Không tải được danh sách report." : "Failed to load report list.")}
        </p>
      ) : reports.length === 0 ? (
        <EmptyState
          title={locale === "vi" ? "Chưa có report nào" : "No reports available"}
          description={
            reportType
              ? locale === "vi"
                ? `Không có report nào với loại ${getReportTypeLabel(reportType)}`
                : `No reports available with type ${getReportTypeLabel(reportType)}`
              : locale === "vi"
                ? "Các report bạn tạo sẽ xuất hiện tại đây."
                : "Your created reports will appear here."
          }
        />
      ) : (
        <TableCustom
          headers={headers}
          data={reports}
          pagination={{
            currentPage: data?.pageIndex ?? currentPage,
            pageSize: data?.pageSize ?? PAGE_SIZE,
            totalItems: data?.totalRecords ?? 0,
            onPageChange: setCurrentPage,
          }}
          renderRow={(report, index) => {
            const content = getContent(report.contentVN, report.contentEN);
            const response = getContent(report.responseVN, report.responseEN);
            const responserName = report.responserUser?.fullName || "—";
            const responserEmail = report.responserUser?.email || "";

            // Get reported item image and title based on report type
            let reportedItemImage = "";
            let reportedItemTitle = "";

            if (report.reportType === "Club" && report.reportedClub) {
              reportedItemImage = report.reportedClub.imageUrl || "/images/club-placeholder.jpg";
              reportedItemTitle = locale === "vi" ? report.reportedClub.nameVN : report.reportedClub.nameEN || report.reportedClub.nameVN;
            } else if (report.reportType === "CourseVersion" && report.reportedCourseVersion) {
              reportedItemImage = report.reportedCourseVersion.imageUrl || "/images/course-placeholder.jpg";
              const courseTitle = locale === "vi" ? report.reportedCourseVersion.titleVN : report.reportedCourseVersion.titleEN || report.reportedCourseVersion.titleVN;
              reportedItemTitle = `${courseTitle}`;
            } else if (report.reportType === "User" && report.reportedUser) {
              reportedItemImage = report.reportedUser.avatarUrl || "/images/user-placeholder.jpg";
              reportedItemTitle = report.reportedUser.fullName;
            }

            return (
              <>
                <TableCell className="text-greyscale-100">
                  {(data?.pageIndex ? (data.pageIndex - 1) * data.pageSize : 0) + index + 1}
                </TableCell>
                <TableCell className="text-greyscale-0">
                  {getReportTypeLabel(report.reportType)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-greyscale-700 bg-greyscale-800">
                      <Image
                        src={reportedItemImage}
                        alt={reportedItemTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm text-greyscale-0">{reportedItemTitle}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-120 whitespace-pre-wrap text-greyscale-50">
                  {content}
                </TableCell>
                <TableCell className="max-w-120 whitespace-pre-wrap text-greyscale-50">
                  {response || (locale === "vi" ? "Chưa có phản hồi" : "No response yet")}
                </TableCell>
                <TableCell className="text-greyscale-100">
                  <div className="space-y-1">
                    <p className="font-medium text-greyscale-0">{responserName}</p>
                    {responserEmail ? (
                      <p className="text-xs text-greyscale-300">{responserEmail}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-greyscale-100">
                  {getStatusBadge(Boolean(response))}
                </TableCell>
              </>
            );
          }}
        />
      )}

      {isFetching && !isLoading ? (
        <p className="text-xs text-greyscale-400">
          {locale === "vi" ? "Đang cập nhật danh sách..." : "Updating list..."}
        </p>
      ) : null}
    </div>
  );
}
