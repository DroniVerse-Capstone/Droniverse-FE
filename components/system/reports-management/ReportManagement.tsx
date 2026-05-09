"use client";

import React from "react";
import Image from "next/image";
import toast from "react-hot-toast";

import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useGetReports, useRespondReport } from "@/hooks/report/useReport";
import { useLocale } from "@/providers/i18n-provider";
import type { Report } from "@/validations/report/report";

const PAGE_SIZE = 10;

const REPORT_TYPE_OPTIONS = [
  { labelEN: "All", labelVN: "Tất cả", value: undefined },
  { labelEN: "Club", labelVN: "Câu lạc bộ", value: "Club" },
  { labelEN: "CourseVersion", labelVN: "Khóa học", value: "CourseVersion" },
] as const;

type ReportTypeValue = (typeof REPORT_TYPE_OPTIONS)[number]["value"];

export default function ReportManagement() {
  const locale = useLocale();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [reportType, setReportType] = React.useState<ReportTypeValue>(undefined);
  const [responseDialogOpen, setResponseDialogOpen] = React.useState(false);
  const [activeReport, setActiveReport] = React.useState<Report | null>(null);
  const [responseVN, setResponseVN] = React.useState("");
  const [responseEN, setResponseEN] = React.useState("");
  const respondReportMutation = useRespondReport();

  const { data, isLoading, isError, error, isFetching } = useGetReports({
    pageIndex: currentPage,
    pageSize: PAGE_SIZE,
    reportType,
  });

  const reports = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const headers = [
    "STT",
    locale === "vi" ? "Loại khiếu nại" : "Report type",
    locale === "vi" ? "Nội dung bị khiếu nại" : "Reported item",
    locale === "vi" ? "Người gửi" : "Reporter",
    locale === "vi" ? "Nội dung" : "Content",
    locale === "vi" ? "Phản hồi" : "Response",
    locale === "vi" ? "Người phản hồi" : "Responder",
    locale === "vi" ? "Thao tác" : "Actions",
  ];

  const getReportTypeLabel = (value: string) => {
    if (value === "Club") return locale === "vi" ? "Câu lạc bộ" : "Club";
    if (value === "CourseVersion") return locale === "vi" ? "Khóa học" : "Course";
    if (value === "User") return locale === "vi" ? "Người dùng" : "User";
    return value;
  };

  const getContent = (vn: string | null, en: string | null) =>
    (locale === "vi" ? vn || en : en || vn) || "";

  const getStatusBadge = (hasResponse: boolean) => {
    if (hasResponse) {
      return (
        <Badge variant="success" className="whitespace-nowrap px-3 py-1">
          {locale === "vi" ? "Đã phản hồi" : "Responded"}
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="whitespace-nowrap border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-300"
      >
        {locale === "vi" ? "Chờ phản hồi" : "Pending"}
      </Badge>
    );
  };

  const openResponseDialog = (report: Report) => {
    setActiveReport(report);
    setResponseVN(report.responseVN || "");
    setResponseEN(report.responseEN || "");
    setResponseDialogOpen(true);
  };

  const resetResponseDialog = () => {
    setActiveReport(null);
    setResponseVN("");
    setResponseEN("");
  };

  const handleSubmitResponse = async () => {
    if (!activeReport) return;

    const trimmedVN = responseVN.trim();
    const trimmedEN = responseEN.trim();

    if (!trimmedVN || !trimmedEN) {
      toast.error(
        locale === "vi"
          ? "Vui lòng nhập cả phản hồi tiếng Việt và tiếng Anh."
          : "Please enter both Vietnamese and English responses.",
      );
      return;
    }

    try {
      const response = await respondReportMutation.mutateAsync({
        reportId: activeReport.reportID,
        payload: {
          responseVN: trimmedVN,
          responseEN: trimmedEN,
        },
      });

      toast.success(
        response.message ||
          (locale === "vi" ? "Phản hồi report thành công." : "Report responded successfully."),
      );
      setResponseDialogOpen(false);
      resetResponseDialog();
    } catch (reportError) {
      const message =
        (reportError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (reportError as { message?: string })?.message ||
        (locale === "vi" ? "Không thể phản hồi report." : "Unable to respond to report.");
      toast.error(message);
    }
  };

  return (
    <section className="space-y-5">
      <header className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-greyscale-0">
            {locale === "vi" ? "Quản lý khiếu nại" : "Report management"}
          </h1>
          <p className="text-sm text-greyscale-100">
            {locale === "vi"
              ? "Xem toàn bộ khiếu nại của hệ thống, lọc theo loại khiếu nại và theo dõi phản hồi."
              : "View all system reports, filter by report type, and track responses."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {REPORT_TYPE_OPTIONS.map((option) => {
            const displayLabel = locale === "vi" ? option.labelVN : option.labelEN;
            return (
              <button
                key={`${option.labelEN}-${option.labelVN}`}
                type="button"
                onClick={() => {
                  setCurrentPage(1);
                  setReportType(option.value);
                }}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
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
      </header>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : isError ? (
        <EmptyState
          title={locale === "vi" ? "Không tải được report" : "Unable to load reports"}
          description={
            error.response?.data?.message ||
            error.message ||
            (locale === "vi"
              ? "Đã xảy ra lỗi khi tải danh sách report."
              : "An error occurred while loading reports.")
          }
        />
      ) : reports.length === 0 ? (
        <EmptyState
          title={locale === "vi" ? "Chưa có report nào" : "No reports yet"}
          description={
            reportType
              ? locale === "vi"
                ? `Không có khiếu nại nào thuộc loại ${getReportTypeLabel(reportType)}.`
                : `There are no reports for ${getReportTypeLabel(reportType)}.`
              : locale === "vi"
                ? "Danh sách khiếu nại của hệ thống sẽ hiển thị tại đây."
                : "System reports will appear here."
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
            const responderName = report.responserUser?.fullName || "—";
            const responderEmail = report.responserUser?.email || "";
            const reporterName = report.user?.fullName || "—";
            const reporterEmail = report.user?.email || "";

            // Get reported item image and title based on report type
            let reportedItemImage = "";
            let reportedItemTitle = "";

            if (report.reportType === "Club" && report.reportedClub) {
              reportedItemImage = report.reportedClub.imageUrl || "/images/club-placeholder.jpg";
              reportedItemTitle = locale === "vi" ? report.reportedClub.nameVN : report.reportedClub.nameEN || report.reportedClub.nameVN;
            } else if (report.reportType === "CourseVersion" && report.reportedCourseVersion) {
              reportedItemImage = report.reportedCourseVersion.imageUrl || "/images/course-placeholder.jpg";
              const courseTitle = locale === "vi" ? report.reportedCourseVersion.titleVN : report.reportedCourseVersion.titleEN || report.reportedCourseVersion.titleVN;
              reportedItemTitle = `${courseTitle} (v${report.reportedCourseVersion.version})`;
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
                <TableCell className="text-greyscale-100">
                  <div className="space-y-1">
                    <p className="font-medium text-greyscale-0">{reporterName}</p>
                    {reporterEmail ? (
                      <p className="text-xs text-greyscale-300">{reporterEmail}</p>
                    ) : null}
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
                    <p className="font-medium text-greyscale-0">{responderName}</p>
                    {responderEmail ? (
                      <p className="text-xs text-greyscale-300">{responderEmail}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-greyscale-100">
                  <div className="flex items-center gap-2">
                    {response ? (
                      getStatusBadge(true)
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => openResponseDialog(report)}
                        disabled={respondReportMutation.isPending}
                      >
                        {locale === "vi" ? "Phản hồi" : "Respond"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </>
            );
          }}
        />
      )}

      <Dialog
        open={responseDialogOpen}
        onOpenChange={(nextOpen) => {
          setResponseDialogOpen(nextOpen);
          if (!nextOpen) {
            resetResponseDialog();
          }
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden p-0">
          <div className="flex max-h-[85vh] flex-col">
            <DialogHeader className="border-b border-greyscale-700 px-6 py-5 text-left">
              <DialogTitle>
                {locale === "vi" ? "Phản hồi khiếu nại" : "Respond to report"}
              </DialogTitle>
              <DialogDescription>
                {locale === "vi"
                  ? "Nhập phản hồi bằng tiếng Việt và tiếng Anh cho khiếu nại này."
                  : "Enter Vietnamese and English responses for this report."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-greyscale-0">
                  {locale === "vi" ? "Phản hồi tiếng Việt" : "Vietnamese response"}
                </p>
                <Textarea
                  value={responseVN}
                  onChange={(event) => setResponseVN(event.target.value)}
                  placeholder={
                    locale === "vi"
                      ? "Nhập phản hồi tiếng Việt"
                      : "Enter the Vietnamese response"
                  }
                  className="min-h-28"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-greyscale-0">
                  {locale === "vi" ? "Phản hồi tiếng Anh" : "English response"}
                </p>
                <Textarea
                  value={responseEN}
                  onChange={(event) => setResponseEN(event.target.value)}
                  placeholder={
                    locale === "vi"
                      ? "Nhập phản hồi tiếng Anh"
                      : "Enter the English response"
                  }
                  className="min-h-28"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-greyscale-700 px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setResponseDialogOpen(false)}
                disabled={respondReportMutation.isPending}
              >
                {locale === "vi" ? "Hủy" : "Cancel"}
              </Button>
              <Button
                onClick={handleSubmitResponse}
                disabled={respondReportMutation.isPending}
              >
                {respondReportMutation.isPending
                  ? locale === "vi"
                    ? "Đang gửi..."
                    : "Submitting..."
                  : locale === "vi"
                    ? "Gửi phản hồi"
                    : "Submit response"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {isFetching && !isLoading ? (
        <p className="text-xs text-greyscale-300">
          {locale === "vi" ? "Đang cập nhật danh sách..." : "Updating list..."}
        </p>
      ) : null}
    </section>
  );
}
