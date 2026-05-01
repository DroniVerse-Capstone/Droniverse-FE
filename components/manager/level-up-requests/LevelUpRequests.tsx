"use client";

import React from "react";
import { useParams } from "next/navigation";

import EmptyState from "@/components/common/EmptyState";
import { TableCustom } from "@/components/common/TableCustom";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { useGetMyClubs } from "@/hooks/club/useClub";
import { useGetUserAssignmentAttempts } from "@/hooks/assignment/useUserAssignment";
import { Button } from "@/components/ui/button";
import {
  UserAssignmentAttempt,
  UserAssignmentStatus,
} from "@/validations/assignment/user-assignment";
import { cn } from "@/lib/utils";
import LevelUpRequestDetailDialog from "./LevelUpRequestDetailDialog";
import { formatDateTime } from "@/lib/utils/format-date";
import AssignmentStatusBadge from "@/components/common/AssignmentStatusBadge";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PAGE_SIZE = 10;
const STATUS_OPTIONS: Array<{
  label: string;
  value: UserAssignmentStatus | null;
}> = [
  { label: "Tất cả", value: null },
  { label: "Chờ chấm", value: "SUBMITTED" },
  { label: "Đang chấm", value: "UNDER_REVIEW" },
  { label: "Đạt", value: "PASSED" },
  { label: "Không đạt", value: "FAILED" },
];

export default function LevelUpRequests() {
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const { data: myClubs = [] } = useGetMyClubs();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedStatus, setSelectedStatus] = React.useState<
    UserAssignmentStatus | null
  >(null);
  const [selectedAttempt, setSelectedAttempt] =
    React.useState<UserAssignmentAttempt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleViewDetails = (attempt: UserAssignmentAttempt) => {
    setSelectedAttempt(attempt);
    setIsDialogOpen(true);
  };

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const matchedClub = myClubs.find((club) =>
      clubSlug.endsWith(`-${club.clubID}`),
    );
    if (matchedClub) return matchedClub.clubID;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    if (uuidMatch) return uuidMatch[0];

    return undefined;
  }, [clubSlug, myClubs]);

  const { data, isLoading, isError, error } = useGetUserAssignmentAttempts(
    clubId || "",
    currentPage,
    PAGE_SIZE,
    selectedStatus || undefined,
  );

  const attempts = data?.data?.data ?? [];

  const headers = [
    "STT",
    "Người nộp",
    "Lần nộp",
    "Trạng thái",
    "Ngày nộp",
    "Điểm",
    "Ngày chấm",
    "Bài nộp",
  ];

  if (!clubId && !isLoading) {
    return (
      <div className="px-6 py-4">
        <EmptyState title="Không tìm thấy câu lạc bộ" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-greyscale-0">
            Yêu cầu thăng cấp
          </h2>
          {!isLoading && attempts.length > 0 && (
            <p className="mt-1 text-sm text-greyscale-400">
              Tổng cộng: {" "}
              <span className="text-primary font-medium">
                {data?.data?.totalRecords ?? 0}
              </span>{" "}
              yêu cầu
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_OPTIONS.map((statusOption) => (
              <button
                key={statusOption.value ?? "ALL"}
                type="button"
                onClick={() => {
                  setSelectedStatus((prev) =>
                    prev === statusOption.value ? null : statusOption.value,
                  );
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  selectedStatus === statusOption.value
                    ? "bg-primary text-greyscale-0"
                    : "bg-greyscale-700 text-greyscale-100 hover:bg-greyscale-600",
                )}
              >
                {statusOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-60 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-error/20 bg-error/5 p-4">
          <p className="text-sm text-error">
            {error.response?.data?.message ||
              error.message ||
              "Không thể tải danh sách yêu cầu"}
          </p>
        </div>
      ) : attempts.length === 0 ? (
        <EmptyState title="Chưa có yêu cầu nâng cấp nào" />
      ) : (
        <TableCustom
          headers={headers}
          data={attempts}
          pagination={{
            currentPage: data?.data?.pageIndex ?? currentPage,
            pageSize: data?.data?.pageSize ?? PAGE_SIZE,
            totalItems: data?.data?.totalRecords ?? 0,
            onPageChange: setCurrentPage,
          }}
          renderRow={(attempt, index) => (
            <>
              <TableCell className="text-greyscale-100">
                {(data?.data?.pageIndex
                  ? (data.data.pageIndex - 1) *
                    (data.data.pageSize || PAGE_SIZE)
                  : 0) +
                  index +
                  1}
              </TableCell>
              <TableCell className="max-w-55 text-greyscale-50">
                <div className="space-y-0.5">
                  <p className="truncate font-medium text-greyscale-0">
                    {attempt.user?.fullName || "-"}
                  </p>
                  <p className="truncate text-xs text-greyscale-400">
                    {attempt.user?.email || "-"}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-greyscale-50 text-center">
                {attempt.attemptNumber}
              </TableCell>
              <TableCell>
                <AssignmentStatusBadge status={attempt.status} />
              </TableCell>
              <TableCell className="text-greyscale-50 text-xs">
                {formatDateTime(attempt.submittedAt)}
              </TableCell>
              <TableCell className="text-greyscale-50 font-medium">
                {attempt.score !== null ? (
                  <span
                    className={
                      Number(attempt.score) >= 50
                        ? "text-success"
                        : "text-error"
                    }
                  >
                    {attempt.score}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-greyscale-50 text-xs">
                {formatDateTime(attempt.reviewedAt)}
              </TableCell>
              <TableCell>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewDetails(attempt)}
                >
                  Xem chi tiết
                </Button>
              </TableCell>
            </>
          )}
        />
      )}

      <LevelUpRequestDetailDialog
        attempt={selectedAttempt}
        open={isDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedAttempt(null);
          }
        }}
      />
    </div>
  );
}
